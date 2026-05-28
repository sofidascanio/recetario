import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import styles from './MainLayout.module.css'

export default function MainLayout() {
    return (
        <div className={styles.layout}>
            <Header />
                <main className={styles.main}>
                    <Outlet />
                </main>
            <BottomNav />
        </div>
  )
}