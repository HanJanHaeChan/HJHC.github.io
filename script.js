const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

// 로컬 스토리지에서 포스트 로드 또는 초기화
let posts = JSON.parse(localStorage.getItem('posts')) || [
    { id: 1, title: "블로그 포스트 1", content: "포스트에 대한 간단한 설명입니다.", image: "https://placehold.co/600x400/a0aec0/ffffff?text=Post+1" },
    { id: 2, title: "블로그 포스트 2", content: "포스트에 대한 간단한 설명입니다.", image: "https://placehold.co/600x400/718096/ffffff?text=Post+2" },
    { id: 3, title: "블로그 포스트 3", content: "포스트에 대한 간단한 설명입니다.", image: "https://placehold.co/600x400/4a5568/ffffff?text=Post+3" }
];

function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

function renderBlog() {
    return `
        <section id="blog">
            <h2 class="text-3xl font-bold border-b-4 border-blue-500 pb-2 mb-8">Blog</h2>
            <div id="post-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                ${posts.map(post => `
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer" onclick="openModalById(${post.id})">
                        <img src="${post.image}" alt="${post.title} 이미지" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-2">${post.title}</h3>
                            <p class="text-gray-600">${post.content}</p>
                            <button class="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onclick="event.stopPropagation(); deletePost(${post.id})">삭제</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

const pageContents = {
    blog: renderBlog,
    about: `
        <section id="about">
            <h2 class="text-3xl font-bold border-b-4 border-blue-500 pb-2 mb-8">About Me</h2>
            <div class="bg-white p-8 rounded-lg shadow-lg">
                <p class="mb-4">안녕하세요! 저는 창의적인 문제 해결을 즐기는 웹 개발자입니다.</p>
                <p>주로 사용하는 기술은 HTML, CSS, JavaScript입니다.</p>
            </div>
        </section>
    `,
    contact: `
        <section id="contact">
            <h2 class="text-3xl font-bold border-b-4 border-blue-500 pb-2 mb-8">Contact</h2>
            <div class="bg-white p-8 rounded-lg shadow-lg">
                <p class="mb-4">문의사항이 있다면 연락 주세요.</p>
                <ul class="space-y-2"><li><span>email@example.com</span></li><li><span>010-1234-5678</span></li></ul>
            </div>
        </section>
    `,
    'add-post': `
        <section id="add-post">
            <h2 class="text-3xl font-bold border-b-4 border-blue-500 pb-2 mb-8">새 포스트 추가</h2>
            <div class="bg-white p-8 rounded-lg shadow-lg">
                <form id="post-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">제목</label>
                        <input type="text" id="post-title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">내용</label>
                        <textarea id="post-content" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="3"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">사진 업로드</label>
                        <div id="drop-zone" class="drop-zone mt-1">드래그하거나 클릭해서 파일 선택</div>
                        <input type="file" id="file-input" accept="image/*" class="hidden">
                        <img id="preview" class="mt-2 max-h-48" style="display:none;">
                    </div>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">업로드</button>
                </form>
            </div>
        </section>
    `
};

function loadContent(page) {
    const content = pageContents[page] || pageContents.blog;
    mainContent.innerHTML = typeof content === 'function' ? content() : content;
    mainContent.classList.remove('fade-in');
    // Trigger reflow to restart the animation
    void mainContent.offsetWidth;
    mainContent.classList.add('fade-in');

    navLinks.forEach(link => {
        if (link.dataset.page === page) link.classList.add('nav-active');
        else link.classList.remove('nav-active');
    });

    if (page === 'add-post') {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const preview = document.getElementById('preview');
        const form = document.getElementById('post-form');

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            handleFile(file);
        });

        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleFile(file);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;
            const image = preview.src || 'https://placehold.co/600x400/ffffff?text=No+Image';

            const newPost = {
                id: Date.now(),
                title,
                content,
                image
            };
            posts.push(newPost);
            savePosts();
            loadContent('blog');
        });
    }
}

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview').src = e.target.result;
            document.getElementById('preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function openModalById(id) {
    const post = posts.find(p => p.id === id);
    if (post) {
        openModal(post);
    }
}

function openModal(post) {
    modalContent.innerHTML = `
        <div class="p-8">
            <img src="${post.image}" alt="${post.title} 이미지" class="w-full h-64 object-cover rounded-t-lg mb-4">
            <h2 class="text-3xl font-bold mb-4">${post.title}</h2>
            <p class="text-gray-700 mb-6">${post.content}</p>
            <button id="close-modal" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
        </div>
    `;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');

    document.getElementById('close-modal').addEventListener('click', closeModal);
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

function deletePost(id) {
    posts = posts.filter(post => post.id !== id);
    savePosts();
    loadContent('blog');
}

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const page = link.dataset.page;
        loadContent(page);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    loadContent('blog');
    if (!localStorage.getItem('posts')) {
        savePosts();
    }
});
