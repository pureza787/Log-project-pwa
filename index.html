// ==========================================
// 1. เชื่อมต่อ Firebase
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, 
    doc, updateDoc, deleteDoc, query 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBomWqhgW1OTz4EXkSIUZDPQGNCZSOkp7M",
  authDomain: "work-recording-system.firebaseapp.com",
  projectId: "work-recording-system",
  storageBucket: "work-recording-system.firebasestorage.app",
  messagingSenderId: "479762558012",
  appId: "1:479762558012:web:3441e1596ff28abfa1a739",
  measurementId: "G-CJ6XL68KVG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const TASKS_COLLECTION = "tasks";

// ==========================================
// 2. ตัวแปร Global
// ==========================================
let tasks = []; 
let subjectsList = [];
let currentEditingId = null;

let notifiedTaskIds = new Set(); // กันแจ้งเตือนซ้ำ
let isNotificationEnabled = true; // สถานะเปิด/ปิด

// ==========================================
// 3. ฟังก์ชัน Notification (ระบบแจ้งเตือน)
// ==========================================

// อัปเดตข้อความสถานะบนหน้าจอ (สีเขียว/แดง)
function updateNotificationUI() {
    const statusEl = document.getElementById('notifStatus');
    if (!statusEl) return;

    try {
        if (!('Notification' in window)) {
            statusEl.innerHTML = "❌ ไม่รองรับ";
            statusEl.style.color = "red";
            return;
        }

        if (Notification.permission === 'granted' && isNotificationEnabled) {
            statusEl.innerHTML = "✅ เปิดใช้งานอยู่";
            statusEl.style.color = "green";
        } else {
            statusEl.innerHTML = "🔕 ปิดอยู่";
            statusEl.style.color = "gray";
        }
    } catch (e) {
        console.warn('updateNotificationUI error:', e);
        statusEl.innerHTML = "⚠️ ตรวจสอบไม่ได้";
        statusEl.style.color = "orange";
    }
}

// ปุ่มเปิดการแจ้งเตือน
window.enableNotifications = function() {
    try {
        if (!('Notification' in window)) {
            alert('❌ เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                isNotificationEnabled = true;
                updateNotificationUI();
                
                showNotification('✅ เปิดใช้งานสำเร็จ!', 'ระบบจะแจ้งเตือนเมื่อมีงานใกล้กำหนดส่ง');
                checkDeadlines(); // เช็คงานทันที
            } else if (permission === 'denied') {
                alert('❌ คุณปิดกั้นการแจ้งเตือนไว้ที่ตั้งค่าของ Browser');
                updateNotificationUI();
            }
        }).catch(err => {
            console.warn('Notification permission error:', err);
            alert('❌ ไม่สามารถขอสิทธิ์การแจ้งเตือน');
        });
    } catch (e) {
        console.warn('Notification error:', e);
        alert('❌ เกิดข้อผิดพลาดในการแจ้งเตือน');
    }
}

// ปุ่มปิดการแจ้งเตือน
window.disableNotifications = function() {
    isNotificationEnabled = false;
    alert('🔕 ปิดการแจ้งเตือนแล้ว');
    updateNotificationUI();
}

// ฟังก์ชันยิงแจ้งเตือน
function showNotification(title, body) {
    try {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted' || !isNotificationEnabled) return;
        
        // ใช้ Service Worker (สำหรับมือถือ/Android)
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: './logo.png',
                    vibrate: [200, 100, 200]
                }).catch(err => {
                    console.warn('showNotification error:', err);
                });
            });
        } else {
            // ใช้แบบปกติ (สำหรับ PC)
            new Notification(title, { 
                body: body, 
                icon: './logo.png' 
            });
        }
    } catch (e) {
        console.warn('Notification error:', e);
        // ไม่แจ้งเตือน ให้เงียบๆ ไม่ให้ error ขึ้นมา
    }
}

// ฟังก์ชันเช็คกำหนดส่งงาน
function checkDeadlines() {
    try {
        // ถ้าปิดอยู่ ไม่ต้องเช็ค
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted' || !isNotificationEnabled) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const next3Days = new Date(today);
        next3Days.setDate(next3Days.getDate() + 3);

        tasks.forEach(task => {
            if (!task.completed && task.due) {
                // เช็คว่าเคยแจ้งงานนี้ไปหรือยัง (กันเด้งรัวๆ)
                if (notifiedTaskIds.has(task.id)) return;

                const dueDate = new Date(task.due);
                dueDate.setHours(0, 0, 0, 0);
                
                let shouldNotify = false;
                let title = "";
                let msg = "";

                if (dueDate < today) {
                    title = `🚨 งานเลยกำหนด!`;
                    msg = `${task.name} รีบปั่นด่วน!`;
                    shouldNotify = true;
                }
                else if (dueDate.getTime() === today.getTime()) {
                    title = `🔥 งานส่งวันนี้!`;
                    msg = `${task.name} (${task.subject}) หมดเขตวันนี้แล้วนะ`;
                    shouldNotify = true;
                }
                else if (dueDate.getTime() === tomorrow.getTime()) {
                    title = `⚠️ งานส่งพรุ่งนี้`;
                    msg = `เตรียมส่ง: ${task.name} (${task.subject})`;
                    shouldNotify = true;
                }
                else if (dueDate.getTime() === next3Days.getTime()) {
                    title = `📅 อีก 3 วันส่ง`;
                    msg = `${task.name} อย่าลืมทำนะ`;
                    shouldNotify = true;
                }

                if (shouldNotify) {
                    showNotification(title, msg);
                    notifiedTaskIds.add(task.id); // จำไว้ว่าแจ้งแล้ว
                }
            }
        });
    } catch (e) {
        console.warn('checkDeadlines error:', e);
    }
}

// ==========================================
// 4. โหลดข้อมูล & จัดการงาน
// ==========================================

async function loadSubjects() {
    if (typeof SUBJECT_DATA !== 'undefined') {
        subjectsList = SUBJECT_DATA;
    } else {
        try {
            const response = await fetch('db.json');
            if (response.ok) subjectsList = await response.json();
        } catch (e) { console.error("Load subjects error", e); }
    }

    const subjectDropdown = document.getElementById('taskSubject');
    if(subjectDropdown) {
        subjectDropdown.innerHTML = '<option value="" disabled selected>-- เลือกวิชา --</option>'; 
        
        subjectsList.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.name; 
            option.textContent = subject.name;
            subjectDropdown.appendChild(option);
        });
        
        const otherOption = document.createElement('option');
        otherOption.value = 'other';
        otherOption.textContent = 'วิชาอื่นๆ (พิมพ์เอง)';
        subjectDropdown.appendChild(otherOption);
    }
}

function listenToTasks() {
    const q = query(collection(db, TASKS_COLLECTION));
    document.getElementById('tasksList').innerHTML = '<div style="text-align:center; padding:20px;">⏳ กำลังโหลดข้อมูล...</div>';

    onSnapshot(q, (snapshot) => {
        tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTasks();
        updateStats();
        checkDeadlines(); // เช็คแจ้งเตือนทุกครั้งที่ข้อมูลเปลี่ยน
    }, (error) => {
        console.error("Error: ", error);
        document.getElementById('tasksList').innerHTML = '<div style="color:red; text-align:center;">❌ โหลดข้อมูลไม่สำเร็จ</div>';
    });
}

function renderTasks() {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';
    
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.due) - new Date(b.due);
    });

    if (sortedTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">🎉 ไม่มีงานค้าง พักผ่อนได้!</p>';
        return;
    }

    const today = new Date(); today.setHours(0,0,0,0);

    sortedTasks.forEach(task => {
        const dueDate = new Date(task.due);
        const isOverdue = dueDate < today && !task.completed;
        const isUrgent = task.priority === 'urgent' && !task.completed;
        
        // --- สร้างป้ายสถานะ (Badge) ---
        let statusBadge = '';
        let cardClass = '';

        if (task.completed) {
            statusBadge = '<span class="status-badge status-done">✅ เสร็จแล้ว</span>';
            cardClass = 'completed';
        } else if (isOverdue) {
            statusBadge = '<span class="status-badge status-overdue">🚨 เลยกำหนด</span>';
            cardClass = 'overdue';
        } else {
            if (dueDate.getTime() === today.getTime()) {
                 statusBadge = '<span class="status-badge status-today">🔥 ส่งวันนี้</span>';
            } else {
                 statusBadge = '<span class="status-badge status-pending">⏳ รอดำเนินการ</span>';
            }
            if (isUrgent) cardClass = 'urgent';
        }

        const html = `
            <div class="task-item ${cardClass}">
                <div class="task-header">
                    <div class="task-title">${task.name}</div>
                    ${statusBadge} </div>
                
                <div style="margin-bottom: 8px;">
                     <span class="task-subject">${task.subject}</span>
                </div>

                ${task.imageUrl ? `<div style="margin: 10px 0;"><img src="${task.imageUrl}" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>` : ''}

                <div class="task-details">
                    📅 กำหนดส่ง: ${formatThaiDate(dueDate)} <br>
                    🕒 สั่งเมื่อ: ${task.assignedOn || '-'} <br>
                    🔥 ความสำคัญ: ${getPriorityLabel(task.priority)}
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                
                <div class="task-actions">
                    <button class="btn btn-small ${task.completed ? 'btn-warning' : 'btn-success'}" 
                            onclick="window.toggleComplete('${task.id}', ${!task.completed})">
                        ${task.completed ? '↩️ ทำซ้ำ' : '✅ เสร็จแล้ว'}
                    </button>
                    <button class="btn btn-small btn-info" onclick="window.editTask('${task.id}')">✏️ แก้ไข</button>
                    <button class="btn btn-small btn-danger" onclick="window.deleteTask('${task.id}')">🗑️ ลบ</button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// ฟังก์ชันเพิ่ม/แก้ไขงาน
window.addTask = async function() {
    const name = document.getElementById('taskName').value.trim();
    const assignedOn = document.getElementById('taskAssignedOn').value;
    const due = document.getElementById('taskDue').value; 
    const priority = document.getElementById('taskPriority').value;
    const description = document.getElementById('taskDescription').value.trim();

    if (!name || !due) { alert('❌ กรุณากรอก "ชื่องาน" และ "กำหนดส่ง"'); return; }
    
    let subject = document.getElementById('taskSubject').value;
    if (subject === 'other' || !subject) {
        subject = document.getElementById('taskSubjectOther').value.trim() || "งานทั่วไป";
    }

    const taskData = {
        name, subject, assignedOn, due, priority, description,
        imageUrl: null, // สำหรับเก็บ URL รูปภาพ
        updatedAt: new Date().toISOString()
    };
    
    if (!currentEditingId) taskData.completed = false;

    const btn = document.getElementById('submitTaskButton');
    btn.disabled = true; btn.innerText = "⏳ กำลังบันทึก...";

    try {
        // ถ้ามีรูปภาพ ให้อัปโหลดขึ้น Firebase Storage ก่อน
        if (selectedImageBase64) {
            const timestamp = new Date().getTime();
            const imageName = `task_${currentEditingId || timestamp}_${selectedImageName}`;
            const imageRef = ref(storage, `task-images/${imageName}`);
            
            // แปลง Base64 เป็น Blob
            const response = await fetch(selectedImageBase64);
            const blob = await response.blob();
            
            // อัปโหลดรูป
            await uploadBytes(imageRef, blob);
            
            // ได้ URL ของรูป
            taskData.imageUrl = await getDownloadURL(imageRef);
        }

        if (currentEditingId) {
            await updateDoc(doc(db, TASKS_COLLECTION, currentEditingId), taskData);
            showNotification('แก้ไขงานสำเร็จ', `อัปเดตงาน "${name}" เรียบร้อยแล้ว`);
        } else {
            await addDoc(collection(db, TASKS_COLLECTION), {
                ...taskData,
                createdAt: new Date().toISOString()
            });
            showNotification('เพิ่มงานสำเร็จ', `บันทึกงาน "${name}" เรียบร้อยแล้ว`);
        }
        window.clearForm();
    } catch (e) {
        console.error("Error adding/updating: ", e);
        alert('❌ เกิดข้อผิดพลาด: ' + e.message);
    } finally {
        btn.disabled = false; btn.innerText = "➕ เพิ่มงาน";
    }
}

window.clearForm = function() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskAssignedOn').value = 'ไม่ระบุ';
    document.getElementById('taskDue').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskSubject').value = '';
    window.clearImage(); // ล้างรูปภาพด้วย
    const otherInput = document.getElementById('taskSubjectOther');
    if(otherInput) otherInput.style.display = 'none';
    currentEditingId = null;
    document.getElementById('submitTaskButton').innerText = "➕ เพิ่มงาน";
}

window.checkOtherSubject = function(elem) {
    const otherInput = document.getElementById('taskSubjectOther');
    otherInput.style.display = elem.value === 'other' ? 'block' : 'none';
}

window.toggleComplete = async function(id, status) {
    await updateDoc(doc(db, TASKS_COLLECTION, id), { completed: status });
}

window.deleteTask = async function(id) {
    if (confirm('ต้องการลบงานนี้ใช่ไหม?')) {
        await deleteDoc(doc(db, TASKS_COLLECTION, id));
    }
}

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    currentEditingId = id;
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDue').value = task.due;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDescription').value = task.description || '';
    
    const subjectSelect = document.getElementById('taskSubject');
    let found = false;
    for(let i=0; i<subjectSelect.options.length; i++) {
        if(subjectSelect.options[i].value === task.subject) {
            subjectSelect.selectedIndex = i;
            found = true;
            break;
        }
    }
    if (!found) {
        subjectSelect.value = 'other';
        window.checkOtherSubject(subjectSelect);
        document.getElementById('taskSubjectOther').value = task.subject;
    } else {
        window.checkOtherSubject(subjectSelect);
    }

    const assignedSelect = document.getElementById('taskAssignedOn');
    if (task.assignedOn) assignedSelect.value = task.assignedOn;

    document.getElementById('submitTaskButton').innerText = "💾 บันทึกการแก้ไข";
    document.querySelector('.config-section').scrollIntoView({ behavior: 'smooth' });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    const today = new Date(); today.setHours(0,0,0,0);
    const overdue = tasks.filter(t => new Date(t.due) < today && !t.completed).length;
    const todayTasks = tasks.filter(t => {
        const d = new Date(t.due); d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && !t.completed;
    }).length;

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card stat-total">
            <div class="stat-number">${total}</div><div class="stat-label">งานทั้งหมด</div>
        </div>
        <div class="stat-card stat-completed">
            <div class="stat-number">${completed}</div><div class="stat-label">เสร็จแล้ว</div>
        </div>
        <div class="stat-card stat-pending">
            <div class="stat-number">${pending}</div><div class="stat-label">รอดำเนินการ</div>
        </div>
        <div class="stat-card stat-overdue">
            <div class="stat-number">${overdue}</div><div class="stat-label">เลยกำหนด</div>
        </div>
        <div class="stat-card stat-today">
            <div class="stat-number">${todayTasks}</div><div class="stat-label">งานวันนี้</div>
        </div>
    `;
}

function getPriorityLabel(p) {
    if(p==='urgent') return '🔴 เร่งด่วน';
    if(p==='important') return '🟡 สำคัญ';
    return '🟢 ปกติ';
}

// ==========================================
// 5. ฟังก์ชันรูปภาพ
// ==========================================

let selectedImageBase64 = null;
let selectedImageName = null;

window.setupImageUpload = function() {
    const imageInput = document.getElementById('taskImage');
    if (!imageInput) return;

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // เช็คขนาดไฟล์ (ไม่เกิน 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('❌ ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
            imageInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            selectedImageBase64 = event.target.result;
            selectedImageName = file.name;

            // แสดง preview
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${selectedImageBase64}" style="max-width: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <button type="button" class="btn btn-small btn-danger" 
                            style="margin-top: 10px; width: 100%;" 
                            onclick="window.clearImage()">✕ ลบรูป</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    });
}

window.clearImage = function() {
    selectedImageBase64 = null;
    selectedImageName = null;
    document.getElementById('taskImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

// ==========================================
// ส่วนท้ายไฟล์: เริ่มทำงานเมื่อเปิดหน้าเว็บ
// ==========================================
window.onload = function() {
    loadSubjects();
    listenToTasks();
    setupImageUpload();
    
    // เช็คสถานะแจ้งเตือนครั้งแรก (ห่อด้วย try-catch เพื่อไม่ให้ error ถ้า Notification API ไม่พร้อม)
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            isNotificationEnabled = true;
        } else {
            isNotificationEnabled = false;
        }
    } catch (e) {
        console.warn('Notification API error:', e);
        isNotificationEnabled = false;
    }
    
    // อัปเดตข้อความบนหน้าจอ
    updateNotificationUI(); 
}
