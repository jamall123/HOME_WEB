import{t as r}from"./rolldown-runtime-BQ-_32WO.js";var f=r({NotificationManager:()=>s}),s={init(){if(!document.getElementById("notification-container")){const t=document.createElement("div");t.id="notification-container",t.style.cssText=`
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `,document.body.appendChild(t)}this.container=document.getElementById("notification-container")},async requestBrowserPermission(){return"Notification"in window?Notification.permission==="granted"?!0:Notification.permission!=="denied"?await Notification.requestPermission()==="granted":!1:(console.warn("This browser does not support desktop notification"),!1)},showBrowserNotification(t,o={}){if("Notification"in window&&Notification.permission==="granted"){const n=new Notification(t,{icon:"/images/logo.png",...o});n.onclick=function(){window.focus(),this.close()}}},show(t,o="info",n=3e3){this.container||this.init();const i=document.createElement("div");i.className=`toast toast-${o} animate-fade`;const e={success:"var(--success, #10B981)",error:"var(--error, #EF4444)",warning:"var(--warning, #F59E0B)",info:"var(--primary-color, #3B82F6)"},a={success:"fa-check-circle",error:"fa-exclamation-circle",warning:"fa-exclamation-triangle",info:"fa-info-circle"};i.style.cssText=`
            background: rgba(10, 12, 20, 0.95);
            border-left: 4px solid ${e[o]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            font-family: var(--font-ar);
        `,i.innerHTML=`
            <i class="fas ${a[o]}" style="color: ${e[o]};"></i>
            <span>${t}</span>
        `,this.container.appendChild(i),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateY(10px)",i.style.transition="all 0.3s ease",setTimeout(()=>i.remove(),300)},n)}};export{f as n,s as t};
