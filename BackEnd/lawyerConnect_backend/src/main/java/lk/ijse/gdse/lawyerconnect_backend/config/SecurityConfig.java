package lk.ijse.gdse.lawyerconnect_backend.config;

import lombok.RequiredArgsConstructor;
import lk.ijse.gdse.lawyerconnect_backend.util.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor

public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
//                .cors(cors -> cors.configurationSource(request -> {
//                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
//                    corsConfig.setAllowedOrigins(List.of("http://localhost:63343")); // your frontend
//                    corsConfig.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
//                    corsConfig.setAllowedHeaders(List.of("*"));
//                    corsConfig.setAllowCredentials(false);
//                    return corsConfig;
//                }))


                .authorizeHttpRequests(
                        auth->
                        auth
//                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers("/auth/**").permitAll()
                                .requestMatchers("/uploads/**").permitAll()
                                .anyRequest().authenticated())
                .sessionManagement(
                        session->
                        session.sessionCreationPolicy
                                (SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider
                = new DaoAuthenticationProvider();
        daoAuthenticationProvider
                .setUserDetailsService(userDetailsService);
        daoAuthenticationProvider
                .setPasswordEncoder(passwordEncoder);
        return daoAuthenticationProvider;

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:63343"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}
