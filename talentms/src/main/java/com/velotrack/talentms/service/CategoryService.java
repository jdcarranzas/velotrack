package com.velotrack.talentms.service;

import com.velotrack.talentms.dto.CategoryRequest;
import com.velotrack.talentms.dto.CategoryResponse;
import com.velotrack.talentms.model.Category;
import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TalentEvents events;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        Category category = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .isActive(true)
                .build();
        Category saved = categoryRepository.save(category);
        events.categorySaved(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + id));
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        Category saved = categoryRepository.save(category);
        events.categorySaved(saved);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories(boolean activeOnly) {
        return categoryRepository.findAll().stream()
                .filter(c -> !activeOnly || Boolean.TRUE.equals(c.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse updateStatus(Integer id, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + id));
        category.setIsActive(active);
        Category saved = categoryRepository.save(category);
        events.categorySaved(saved);
        return mapToResponse(saved);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .build();
    }
}
