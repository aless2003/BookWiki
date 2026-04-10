package online.hatsune_miku.bookwiki.media;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.sql.Blob;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "media")
@Getter
@Setter
@ToString
public class Media {

    @Id
    private UUID id;

    private String filename;
    private String contentType;

    @Lob
    @Column(columnDefinition = "BYTEA")
    private Blob data;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
    }

    public Media() {
        this.id = UUID.randomUUID();
    }

    public Media(UUID id, String filename, String contentType, Blob data, LocalDateTime createdAt) {
        this.id = id;
        this.filename = filename;
        this.contentType = contentType;
        this.data = data;
        this.createdAt = createdAt;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Media media = (Media) o;
        return getId() != null && Objects.equals(getId(), media.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
