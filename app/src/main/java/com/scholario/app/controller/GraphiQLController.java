package com.scholario.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GraphiQLController {

    @GetMapping("/graphiql-local")
    public String graphiql() {
        return "forward:/graphiql-local/index.html";
    }
}