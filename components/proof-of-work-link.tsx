import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import HandwrittenArrow from "./ui/handwritten-arrow";
import styles from "./proof-of-work-link.module.css";

export default function ProofOfWorkLink() {
  return (
    <div className={styles.callout}>
      <Link href="/background" className={styles.background}>
        <span>Background</span>
      </Link>
      <div className={styles.work}>
        <Link href="/work" className={styles.workLink}>
          Proof of Work
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        <div className={styles.note} aria-hidden="true">
          <HandwrittenArrow className={styles.arrow} />
          <span className={styles.handwriting}>
            start here
            <br />
            see what I&apos;ve shipped
          </span>
        </div>
      </div>
    </div>
  );
}
