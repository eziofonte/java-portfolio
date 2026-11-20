package com.group.portfolio.dwayne;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DwayneController {
    @GetMapping("/dwayne")
    public String index() {
        return "dwayne/index";
    }

    @GetMapping("/dwayne/about")
    public String about() {
        return "dwayne/about";
    }
}
