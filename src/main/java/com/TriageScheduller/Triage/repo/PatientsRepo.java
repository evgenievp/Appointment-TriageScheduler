package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepo extends JpaRepository<Long, User> {

}
