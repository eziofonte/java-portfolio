package com.group.portfolio.alastair;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AlastairController {
    @GetMapping("/alastair")
    public String index() {
        return "alastair/index";
    }
}
