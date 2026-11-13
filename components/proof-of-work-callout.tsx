import Link from "next/link";
import { Caveat } from "next/font/google";
import styles from "./proof-of-work-callout.module.css";

const handwriting = Caveat({ weight: "400", subsets: ["latin"], display: "swap" });

export default function ProofOfWorkCallout() {
  return (
    <div className={styles.sentence}>
      <span className={styles.intro}>
        Check out my <Link href="/background" className={styles.background}>Background</Link> and
      </span>
      <span className={styles.work}>
        <span className={styles.buttonGroup}>
          <Link href="/work" className={styles.button}>Proof of Work</Link>.
        </span>
        <span className={`${handwriting.className} ${styles.note}`} aria-hidden="true">
          {/* Arrow adapted from chanhdai.com (MIT); see public/licenses/chanhdai.txt. */}
          <svg
            className={styles.arrow}
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M34 4c1 15-5 26-21 30" />
            <path d="m22 37-9-3 7.5-8" />
          </svg>
          <span className={styles.text}>Click to see<br />my work</span>
        </span>
      </span>
    </div>
  );
}
