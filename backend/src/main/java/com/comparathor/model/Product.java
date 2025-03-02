import com.comparathor.model.BaseEntity;
import com.comparathor.model.User;
import jakarta.persistence.*;

@Entity
@Table(name = "comparisons", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_comparison_title", columnNames = {"user_id", "title"})
})
public class Comparison extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "comparison", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComparisonProduct> comparisonProducts;
}
