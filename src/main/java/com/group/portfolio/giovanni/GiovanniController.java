package com.group.portfolio.giovanni;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Controller
public class GiovanniController {

    private static final Logger log = LoggerFactory.getLogger(GiovanniController.class);

    /** Changes on every app start so browsers never reuse an old stylesheet. */
    private static final long BUILD = System.currentTimeMillis();

    private final ResourcePatternResolver resolver;

    public GiovanniController(ResourcePatternResolver resolver) {
        this.resolver = resolver;
    }

    /** Every image inside static/giovanni/album/ becomes a slide, sorted by file name. */
    private List<String> albumPhotos() {
        try {
            Resource[] files = resolver.getResources("classpath:static/giovanni/album/*");
            return Arrays.stream(files)
                .map(Resource::getFilename)
                .filter(Objects::nonNull)
                .filter(n -> n.toLowerCase().matches(".+\\.(jpg|jpeg|png|webp|gif|avif)"))
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
        } catch (IOException e) {
            return List.of();
        }
    }

    // ---- Small data holders (edit the data in home() below) ----
    public record Hobby(String category, String items) {}
    public record Award(String year, String title, String detail) {}
    public record Favorite(String symbol, String label, String value) {}
    public record Work(String title, String tag, String detail, String image, String link, List<String> features) {}
    public record Step(String number, String title, String detail) {}

    @GetMapping("/giovanni")
    public String home(Model m) {
        // ===== ABOUT ME  =====
        m.addAttribute("v", BUILD);
        m.addAttribute("name", "Giovanni Hanz C. La Peña");

        // ===== PHOTO ALBUM (drop any photos into src/main/resources/static/giovanni/album/) =====
        List<String> album = albumPhotos();
        m.addAttribute("album", album);

        m.addAttribute("age", "21");
        m.addAttribute("birthday", "October 26, 2005");
        m.addAttribute("height", "5'8\" (173 cm)");
        m.addAttribute("weight", "78 kg");
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
            "HTML and CSS",
            "Java",
            "Python",
            "Figma",
            "Making ERD files",
            "Weka and Orange",
            "hindi kamote sa daan (minsan, oo)"));

        // ===== WORKS (put the image in static/giovanni/; use "" as the link to hide the button) =====
        m.addAttribute("works", List.of(
            new Work("T-Valuate: Used Car Price Predicting System", "WEB SYSTEM",
                "A used-car price predicting system for Toyota vehicles. It estimates a fair price from real listings of sellers across the Philippines, lets buyers browse verified cars, and lets sellers post their own.",
                "tvaluate.png", "",
                List.of("Browse cars", "Sell your car", "Price predictor", "Market data"))));

        // ===== PROCESS =====
        m.addAttribute("steps", List.of(
            new Step("01", "Gather the ingredients", "Collect real listing data and understand what buyers and sellers need."),
            new Step("02", "Write the formula", "Design the ERD and database, then plan the pages and the price model."),
            new Step("03", "Cook", "Build the system in small batches: code, test, fix, repeat."),
            new Step("04", "Purity test", "Check the estimates, polish the UI and ship only what is 99.1% pure.")));

        // ===== FUN FACTS =====
        m.addAttribute("funFacts", List.of(
            "I'm a motorcycle enthusiast who frequently rides to Los Baños to visit my girlfriend at UPLB.",
            "Survived a near-drowning and a two-day coma as a kid, so I like to think I'm pretty hard to take down. (masamang damo yan boi)",
            "Before writing Java code, I was a certified comp shop kid—once stayed so long playing at the computeran that I got locked out of our house.    ",
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
