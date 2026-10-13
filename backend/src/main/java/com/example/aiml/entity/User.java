package com.example.aiml.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;
    private String phone;
private String college;
private String degree;
private Integer graduationYear;

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    public String getPhone() {
    return phone;
}

public void setPhone(String phone) {
    this.phone = phone;
}

public String getCollege() {
    return college;
}

public void setCollege(String college) {
    this.college = college;
}

public String getDegree() {
    return degree;
}

public void setDegree(String degree) {
    this.degree = degree;
}

public Integer getGraduationYear() {
    return graduationYear;
}

public void setGraduationYear(Integer graduationYear) {
    this.graduationYear = graduationYear;
}
}