package com.scholario.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication
@ComponentScan(basePackages = {"com.scholario"})
@EnableJpaRepositories(basePackages = {"com.scholario"})
@EntityScan(basePackages = {"com.scholario"})
public class ScholarioApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScholarioApplication.class, args);
    }
}
