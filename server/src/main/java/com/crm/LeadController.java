package com.crm;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class LeadController {

    private static final Set<String> ALLOWED_STATUSES = Set.of("NEW", "CONTACTED", "CONVERTED");

    private final LeadRepository leadRepository;
    private final NoteRepository noteRepository;

    public LeadController(LeadRepository leadRepository, NoteRepository noteRepository) {
        this.leadRepository = leadRepository;
        this.noteRepository = noteRepository;
    }

    @PostMapping("/leads")
    @ResponseStatus(HttpStatus.CREATED)
    public Lead createLead(@Valid @RequestBody Lead lead) {
        lead.setStatus("NEW");
        if (lead.getSource() == null || lead.getSource().isBlank()) {
            lead.setSource("Website");
        }
        return leadRepository.save(lead);
    }

    @GetMapping("/leads")
    public List<Lead> getLeads(@RequestParam(required = false) String search,
                              @RequestParam(required = false) String status) {
        return leadRepository.searchLeads(search, status);
    }

    @GetMapping("/leads/{id}")
    public Lead getLead(@PathVariable Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
    }

    @PutMapping("/leads/{id}/status")
    public Lead updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        String status = body != null ? body.get("status") : null;
        if (status == null || !ALLOWED_STATUSES.contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Status must be NEW, CONTACTED, or CONVERTED");
        }
        lead.setStatus(status.toUpperCase());
        return leadRepository.save(lead);
    }

    @DeleteMapping("/leads/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteLead(@PathVariable Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        noteRepository.deleteByLeadId(id);
        leadRepository.delete(lead);
        return ResponseEntity.ok(Map.of("message", "Lead deleted successfully"));
    }

    @GetMapping("/leads/{id}/notes")
    public List<Note> getNotes(@PathVariable Long id) {
        if (!leadRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        }
        return noteRepository.findByLeadIdOrderByCreatedAtDesc(id);
    }

    @PostMapping("/leads/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public Note addNote(@PathVariable Long id, @RequestBody Note note) {
        if (!leadRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        }
        if (note.getText() == null || note.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Note text is required");
        }
        note.setLeadId(id);
        return noteRepository.save(note);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", leadRepository.count());
        stats.put("newCount", leadRepository.countByStatus("NEW"));
        stats.put("contactedCount", leadRepository.countByStatus("CONTACTED"));
        stats.put("convertedCount", leadRepository.countByStatus("CONVERTED"));
        return stats;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage()));
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Validation failed");
        response.put("details", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason() != null ? ex.getReason() : "Error"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }
}
