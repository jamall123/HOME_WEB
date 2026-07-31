var r={init(){if(!document.getElementById("notification-container")){const i=document.createElement("div");i.id="notification-container",i.style.cssText=`
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `,document.body.appendChild(i)}this.container=document.getElementById("notification-container")},show(i,e="info",a=3e3){this.container||this.init();const t=document.createElement("div");t.className=`toast toast-${e} animate-fade`;const n={success:"var(--success, #10B981)",error:"var(--error, #EF4444)",warning:"var(--warning, #F59E0B)",info:"var(--primary-color, #3B82F6)"},o={success:"fa-check-circle",error:"fa-exclamation-circle",warning:"fa-exclamation-triangle",info:"fa-info-circle"};t.style.cssText=`
            background: rgba(10, 12, 20, 0.95);
            border-left: 4px solid ${n[e]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            font-family: var(--font-ar);
        `,t.innerHTML=`
            <i class="fas ${o[e]}" style="color: ${n[e]};"></i>
            <span>${i}</span>
        `,this.container.appendChild(t),setTimeout(()=>{t.style.opacity="0",t.style.transform="translateY(10px)",t.style.transition="all 0.3s ease",setTimeout(()=>t.remove(),300)},a)}};export{r as t};
