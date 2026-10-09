package com.velotrack.talentms.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachResponse {
    private Integer id;
    private String name;
    private String email;
    private String status;
    private List<Integer> teamIds;
}