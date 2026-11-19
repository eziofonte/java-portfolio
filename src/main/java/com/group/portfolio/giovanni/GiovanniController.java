package com.group.portfolio.giovanni;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GiovanniController {
    @GetMapping("/giovanni")
    public String index() {
        return "giovanni/index";
    }
}
