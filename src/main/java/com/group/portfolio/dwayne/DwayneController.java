package com.group.portfolio.dwayne;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DwayneController {
    @GetMapping("/dwayne")
    public String index(Model model) {
        model.addAttribute("aboutPage", false);
        return "dwayne/portfolio";
    }

    @GetMapping("/dwayne/about")
    public String about(Model model) {
        model.addAttribute("aboutPage", true);
        return "dwayne/portfolio";
    }
}
