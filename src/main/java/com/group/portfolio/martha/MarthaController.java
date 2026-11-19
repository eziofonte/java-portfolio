package com.group.portfolio.martha;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MarthaController {
    @GetMapping("/martha")
    public String index() {
        return "martha/index";
    }
}
