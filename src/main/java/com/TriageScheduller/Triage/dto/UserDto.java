package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.utils.Role;
import jakarta.validation.constraints.*;

public class UserDto {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    @NotBlank
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    private final Role role = Role.PATIENT;
    @NotBlank
    private String name;
    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+?359|0)[0-9]{9}$",
            message = "Phone must be valid Bulgarian number"
    )
    private String phone;

    public UserDto(String email, String password, String name, String phone) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
    }

}
