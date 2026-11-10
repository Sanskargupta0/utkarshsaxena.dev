import Link from "next/link";
import HandwrittenArrow from "./ui/handwritten-arrow";
import styles from "./proof-of-work-link.module.css";

export default function ProofOfWorkLink() {
  return (
    <div className={styles.callout}>
      <div>
        Check out my <Link href="/work" className={styles.link}>Proof of Work</Link>
        {" and "}
        <Link href="/background" className={styles.link}>Background</Link>.
      </div>
      <div className={styles.note} aria-hidden="true">
        <HandwrittenArrow className={styles.arrow} />
        <span className={styles.handwriting}>
          start here
          <br />
          see what I&apos;ve shipped
        </span>
      </div>
    </div>
  );
}
