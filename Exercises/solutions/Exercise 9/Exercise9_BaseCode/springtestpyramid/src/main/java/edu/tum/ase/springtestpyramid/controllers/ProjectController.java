package edu.tum.ase.springtestpyramid.controllers;

import edu.tum.ase.springtestpyramid.models.Project;
import edu.tum.ase.springtestpyramid.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping(path = "/project")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping("/{projectId}")
    public Project getProject(@PathVariable String projectId) {
        Optional<Project> project = projectRepository.findById(projectId);
        // if project not found, return empty project
        return project.orElseGet(Project::new);
    }

    @PostMapping(value = "/")
    public Project createProject(@RequestBody Project project) {
        Optional<Project> existingProject = projectRepository.findByName(project.getName());
        return existingProject.orElseGet(() -> projectRepository.save(project));
    }
}
