window.toggleMenu = function () {
    const nav = document.querySelector('.nav')
    const icon = document.querySelector('.hamburger')

    if (nav.classList.contains('show')) {
        // start fadeout
        nav.style.opacity = '0'

        setTimeout(() => {
            nav.classList.remove('show')
            nav.style.opacity = '' // reset inline style after fadeout
        }, 300) // match this to your CSS transition duration
    } else {
        // fadein + show
        nav.classList.add('show')
        void nav.offsetWidth // force reflow for transition
        nav.style.opacity = '1'
    }
}