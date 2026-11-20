package com.group.portfolio.giovanni;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
public class GiovanniController {

    private static final Logger log = LoggerFactory.getLogger(GiovanniController.class);

    // ---- Small data holders (edit the data in home() below) ----
    public record Hobby(String category, String items) {}
    public record Award(String year, String title, String detail) {}
    public record Favorite(String symbol, String label, String value) {}
    public record Skill(String name, double purity) {}

    @GetMapping("/giovanni")
    public String home(Model m) {
        // ===== ABOUT ME  (replace every value with the real you) =====
        m.addAttribute("name", "Giovanni");
        m.addAttribute("age", "20");
        m.addAttribute("birthday", "January 1, 2005");
        m.addAttribute("height", "5'8\" (173 cm)");
        m.addAttribute("weight", "65 kg");
        m.addAttribute("personality", "Calm on the outside, scheming a better solution on the inside. Friendly, loyal, and a little bit dramatic.");
        m.addAttribute("strengths", List.of("Problem solving", "Stays cool under pressure", "Fast learner", "Loyal teammate"));
        m.addAttribute("weaknesses", List.of("Overthinks everything", "Procrastinates until 3 AM", "Can't resist one more tweak"));
        m.addAttribute("hobbies", List.of(
            new Hobby("Activities", "Coding, binge-watching series, exploring new cafes"),
            new Hobby("Sports", "Basketball, badminton"),
            new Hobby("Games", "Mobile Legends, Valorant, chess"),
            new Hobby("Music", "Lo-fi, OPM, a little bit of everything"),
            new Hobby("Things I enjoy", "Late-night talks, trying new food, building small projects")));

        // ===== ACHIEVEMENTS =====
        m.addAttribute("awards", List.of(
            new Award("2024", "Dean's Lister", "Kept the grades pure: 99.1% pure."),
            new Award("2023", "Hackathon Finalist", "Shipped a working prototype in 24 hours."),
            new Award("2022", "Best in Programming", "Compiled on the first try. Allegedly."),
            new Award("2021", "Academic Excellence Award", "Consistent honor student.")));

        // ===== FAVORITES =====
        m.addAttribute("favorites", List.of(
            new Favorite("Fd", "Favorite food", "Sinigang"),
            new Favorite("Cl", "Favorite color", "Crystal blue"),
            new Favorite("Mv", "Favorite movie", "El Camino"),
            new Favorite("Sg", "Favorite song", "Your favorite song"),
            new Favorite("Ar", "Favorite artist", "Your favorite artist"),
            new Favorite("Pl", "Favorite place", "Albuquerque (someday)")));

        // ===== SKILLS AND TALENTS =====
        m.addAttribute("skills", List.of(
            new Skill("Java / Spring Boot", 92.4),
            new Skill("HTML & CSS", 96.8),
            new Skill("Problem solving", 99.1),
            new Skill("Drawing / Design", 85.0),
            new Skill("Public speaking", 78.5),
            new Skill("Making people laugh", 99.1)));
        m.addAttribute("talents", List.of("Fixing bugs with one line", "Remembering song lyrics", "Finding the best snack spot", "Making memes on demand"));

        // ===== FUN FACTS =====
        m.addAttribute("funFacts", List.of(
            "I can name every episode of a show I love, but forget where I put my keys.",
            "Hidden talent: I can solve a Rubik's cube in under two minutes.",
            "Weird habit: I talk to my code like it can hear me.",
            "I have started more side projects than I can count, and finished a surprising number.",
            "I will always watch the pilot episode of any show before deciding if it is good."));
        return "giovanni/index";
    }

    @PostMapping("/giovanni/contact")
    public String contact(@RequestParam String name, @RequestParam String email,
                          @RequestParam String message, RedirectAttributes flash) {
        if (name.isBlank() || email.isBlank() || message.isBlank()) {
            flash.addFlashAttribute("error", "Fill in every field so Gio can call you back.");
        } else {
            // Replace with a database, email service, etc. later.
            log.info("New client -> {} <{}>: {}", name, email, message);
            flash.addFlashAttribute("sent", "Message received, " + name + ". Gio will be in touch.");
        }
        return "redirect:/giovanni#contact";
    }
}
