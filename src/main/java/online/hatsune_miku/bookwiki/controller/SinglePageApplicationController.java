package online.hatsune_miku.bookwiki.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SinglePageApplicationController {

    /**
     * Forwards any unmapped paths (excluding API and static files) to the index.html
     * so that the client-side router (React Router) can handle them.
     */
    @GetMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}
