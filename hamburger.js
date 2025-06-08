window.toggleMenu = function () {
    const nav = document.querySelector('.nav')
    const icon = document.querySelector('.hamburger')

    if (nav.classList.contains('show')) {
        nav.style.opacity = '0'

        setTimeout(() => {
            nav.classList.remove('show')
            nav.style.opacity = '' 
        }, 300) 
    } else {
        nav.classList.add('show')
        void nav.offsetWidth
        nav.style.opacity = '1'
    }
}