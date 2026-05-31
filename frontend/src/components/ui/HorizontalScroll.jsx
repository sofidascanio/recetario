import { useRef } from 'react'
import styles from './HorizontalScroll.module.css'

export default function HorizontalScroll({ children, title, seeAllTo }) {
    const scrollRef = useRef(null)

    function scroll(dir) {
        scrollRef.current?.scrollBy({
            left: dir === 'left' ? -280 : 280,
            behavior: 'smooth',
        })
    }

    return (
        <div className={styles.wrapper}>
            {(title || seeAllTo) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    <div className={styles.controls}>
                        <button className={styles.arrow}
                                onClick={() => scroll('left')}
                                aria-label="Anterior">
                            ←
                        </button>
                        <button className={styles.arrow}
                                onClick={() => scroll('right')}
                                aria-label="Siguiente">
                            →
                        </button>
                        {seeAllTo && (
                            <a href={seeAllTo} className={styles.seeAll}>Ver todo →</a>
                        )}
                    </div>
                </div>
            )}

            <div ref={scrollRef} className={styles.track}>
                {children}
            </div>
        </div>
    )
}