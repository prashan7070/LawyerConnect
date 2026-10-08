# ☁️ Azure Deployment & CI/CD Pipeline Guide ($200 Free Credit Allocation)

This guide provides step-by-step instructions for deploying the **LawyerConnect** platform to **Microsoft Azure** using your **$200 Free Credits**, along with automated **GitHub Actions CI/CD pipelines** and **JUnit 5 unit testing**.

---

## 🏗️ Azure Architecture Overview ($200 Free Credits Budget Allocation)

| Component | Azure Resource Service | SKU / Tier | Estimated Cost / Month |
| :--- | :--- | :--- | :--- |
| **Backend API** | **Azure App Service (Linux)** | Standard B1 (Java 17 runtime) | ~$13.00 / month |
| **Frontend Web** | **Azure Static Web Apps** | Free Tier (Node 20 runtime) | **$0.00 / month** |
| **Database** | **Azure Database for MySQL** | Flexible Server (B1ms Burstable) | ~$15.00 / month |
| **Caching** | **Azure Cache for Redis** | Basic C0 (250 MB) | ~$16.00 / month |
| **CI/CD** | **GitHub Actions** | Free (2,000 build min/month) | **$0.00 / month** |
| **Total Estimated Spend** | | | **~$44.00 / month** *(Well within $200 Free Credit!)* |

---

## 🛠️ Step 1: Provision Azure Resources

### 1.1 Azure Database for MySQL Flexible Server
1. Go to the [Azure Portal](https://portal.azure.com) -> **Create a Resource** -> **Azure Database for MySQL flexible server**.
2. **Resource Group**: Create new `rg-lawyerconnect-prod`.
3. **Server Name**: `lawyerconnect-db`.
4. **Compute + Storage**: Select **Standard_B1ms** (1 vCore, 2 GB RAM).
5. **Database Name**: `lawyerconnect_db`.
6. Enable **Allow public access from any Azure service within Azure to this server**.
7. Copy the JDBC Connection URL:
   `jdbc:mysql://lawyerconnect-db.mysql.database.azure.com:3306/lawyerconnect_db?useSSL=true`

### 1.2 Azure Cache for Redis
1. Go to **Azure Portal** -> **Create a Resource** -> **Azure Cache for Redis**.
2. **DNS Name**: `lawyerconnect-redis`.
3. **Pricing Tier**: **Basic C0**.
4. Once provisioned, copy the **Primary Key** and Host Name (`lawyerconnect-redis.redis.cache.windows.net`).

### 1.3 Azure App Service (Backend API)
1. Go to **Azure Portal** -> **Create a Resource** -> **Web App**.
2. **Name**: `lawyerconnect-backend-api`.
3. **Runtime Stack**: **Java 17**, Java SE Embedded Web Server.
4. **Operating System**: **Linux**.
5. **App Service Plan**: **B1 Basic**.
6. Under **Environment Variables (Configuration)**, set:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://lawyerconnect-db.mysql.database.azure.com:3306/lawyerconnect_db?useSSL=true`
   - `SPRING_DATASOURCE_USERNAME` = `<your-db-username>`
   - `SPRING_DATASOURCE_PASSWORD` = `<your-db-password>`
   - `SPRING_DATA_REDIS_HOST` = `lawyerconnect-redis.redis.cache.windows.net`
   - `SPRING_DATA_REDIS_PASSWORD` = `<your-redis-access-key>`
   - `JWT_SECRET` = `LawyerConnectSuperSecretProductionKey2026SriLankaEnterpriseSecurityKey`

### 1.4 Azure Static Web Apps (Frontend)
1. Go to **Azure Portal** -> **Create a Resource** -> **Static Web App**.
2. **Name**: `lawyerconnect-frontend`.
3. **Deployment Details**: Select **GitHub**, authorize your repository.
4. **App Location**: `lawyerconnect-frontend`.
5. **Output Location**: `.next`.

---

## 🧪 Step 2: Automated Unit Testing Suite

The backend now includes automated unit tests using **JUnit 5** and **Mockito**:

- `AuthServiceTest.java`: Validates login authentication, JWT token generation, and blocks public `ADMIN` registration attempts.
- `AdminServiceTest.java`: Tests advocate verification status transitions (`PENDING` -> `APPROVED`) and cache eviction logic.

You can execute unit tests locally at any time:
```bash
cd BackEnd/lawyerConnect_backend
./mvnw test
```

---

## 🔄 Step 3: GitHub Actions CI/CD Pipelines

Two automated pipelines have been generated in your repository:

### 1. Backend Pipeline (`.github/workflows/backend-cicd.yml`)
- Triggers automatically on push to `main` branch.
- Runs `mvn test` (JUnit 5 unit testing).
- Packages executable `.jar` file.
- Automatically deploys to **Azure App Service**.

### 2. Frontend Pipeline (`.github/workflows/frontend-cicd.yml`)
- Triggers automatically on push to `main` branch.
- Installs dependencies & runs TypeScript type checking (`npx tsc --noEmit`).
- Builds Next.js production bundle.
- Deploys static assets to **Azure Static Web Apps**.

---

## 🔑 Step 4: Configure GitHub Repository Secrets

To connect your GitHub repository to Azure:

1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download the Publish Profile from your Azure App Service overview page and paste its XML content here.
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Copy the Deployment Token from your Azure Static Web App overview page.

---

## 🚀 Step 5: Trigger Your Deployment

Simply push your latest changes to GitHub:

```bash
git add .
git commit -m "Deploy LawyerConnect to Azure with CI/CD and Unit Testing"
git push origin main
```

Your GitHub Actions tab will display live progress as it runs unit tests, builds packages, and deploys both frontend and backend to Azure!
