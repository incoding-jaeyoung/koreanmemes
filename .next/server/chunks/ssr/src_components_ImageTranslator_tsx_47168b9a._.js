module.exports = {

"[project]/src/components/ImageTranslator.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ImageTranslator)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function ImageTranslator({ imageFile, onTranslationComplete, onCancel }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [image, setImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isDrawing, setIsDrawing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentSelection, setCurrentSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selections, setSelections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isTranslating, setIsTranslating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scale, setScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 1,
        y: 1
    });
    const [startPoint, setStartPoint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredSelection, setHoveredSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [lastTranslatedImageUrl, setLastTranslatedImageUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // 이미지 로드
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!imageFile) return;
        const img = new Image();
        img.onload = ()=>{
            setImage(img);
            const canvas = canvasRef.current;
            if (canvas) {
                // 컨테이너 너비에 맞게 캔버스 크기 설정
                const container = canvas.parentElement;
                if (container) {
                    const containerWidth = container.clientWidth;
                    const imgRatio = img.width / img.height;
                    // 가로를 컨테이너 너비에 맞추고 비율에 따라 세로 계산
                    const displayWidth = containerWidth;
                    const displayHeight = containerWidth / imgRatio;
                    // 캔버스 크기를 화면 표시 크기로 설정 (좌표 일치를 위해)
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;
                    canvas.style.width = `${displayWidth}px`;
                    canvas.style.height = `${displayHeight}px`;
                    // 스케일 비율 계산: 화면 크기 → 원본 이미지 크기
                    setScale({
                        x: img.width / displayWidth,
                        y: img.height / displayHeight
                    });
                    // 캔버스에 이미지 그리기 (표시 크기에 맞춤)
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
                    }
                }
            }
        };
        const url = URL.createObjectURL(imageFile);
        img.src = url;
        return ()=>URL.revokeObjectURL(url);
    }, [
        imageFile
    ]);
    // 캔버스 그리기
    const drawCanvas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !image) return;
        // 배경 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 이미지 그리기 (화면 크기에 맞춤)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        // 기존 번역된 영역들 그리기 (화면 좌표계에서 직접 그리기)
        selections.forEach((selection)=>{
            if (selection.translatedText) {
                // 선택 영역은 화면 좌표계 기준이므로 직접 사용
                const boxX = selection.startX;
                const boxY = selection.startY;
                const boxWidth = selection.width;
                const boxHeight = selection.height;
                // 반투명 검은색 배경 (85% 투명도)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
                // 경계선 (호버된 영역은 빨간색으로 표시)
                if (hoveredSelection === selection.id) {
                    ctx.strokeStyle = '#ff0000';
                } else {
                    ctx.strokeStyle = '#333333';
                }
                ctx.lineWidth = 1;
                ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
                // X 모양 삭제 표시 (호버된 영역에만)
                if (hoveredSelection === selection.id) {
                    ctx.strokeStyle = '#ff6666';
                    ctx.lineWidth = 2;
                    const margin = Math.min(boxWidth, boxHeight) * 0.1;
                    // X 그리기
                    ctx.beginPath();
                    ctx.moveTo(boxX + margin, boxY + margin);
                    ctx.lineTo(boxX + boxWidth - margin, boxY + boxHeight - margin);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(boxX + boxWidth - margin, boxY + margin);
                    ctx.lineTo(boxX + margin, boxY + boxHeight - margin);
                    ctx.stroke();
                }
                // 폰트 사이즈를 영역에 맞게 동적 계산
                const maxTextWidth = boxWidth * 0.9;
                const maxTextHeight = boxHeight * 0.9;
                // 텍스트 줄바꿈 처리
                const words = selection.translatedText.split(' ');
                // 폰트 사이즈를 찾기 위한 이진 탐색
                let fontSize = Math.min(boxHeight * 0.3, 40) // 시작 폰트 사이즈
                ;
                const minFontSize = 8;
                const maxFontSize = Math.min(boxHeight * 0.5, 60);
                let bestFontSize = minFontSize;
                // 최적 폰트 사이즈 찾기
                for(let testSize = minFontSize; testSize <= maxFontSize; testSize += 2){
                    ctx.font = `bold ${testSize}px Arial, sans-serif`;
                    // 텍스트 줄바꿈 테스트
                    const lines = [];
                    let currentLine = '';
                    for (const word of words){
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        const testWidth = ctx.measureText(testLine).width;
                        if (testWidth <= maxTextWidth) {
                            currentLine = testLine;
                        } else {
                            if (currentLine) {
                                lines.push(currentLine);
                                currentLine = word;
                            } else {
                                lines.push(word);
                            }
                        }
                    }
                    if (currentLine) lines.push(currentLine);
                    // 총 높이 계산
                    const lineHeight = testSize * 1.3;
                    const totalHeight = lines.length * lineHeight;
                    // 텍스트가 영역에 들어가는지 확인
                    if (totalHeight <= maxTextHeight) {
                        bestFontSize = testSize;
                    } else {
                        break;
                    }
                }
                // 최종 폰트 사이즈 적용
                fontSize = Math.max(bestFontSize, minFontSize);
                ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                ctx.fillStyle = 'white' // 텍스트 색상을 흰색으로 변경
                ;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                // 최종 텍스트 줄바꿈
                const lines = [];
                let currentLine = '';
                for (const word of words){
                    const testLine = currentLine ? `${currentLine} ${word}` : word;
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth <= maxTextWidth) {
                        currentLine = testLine;
                    } else {
                        if (currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            lines.push(word);
                        }
                    }
                }
                if (currentLine) lines.push(currentLine);
                // 다중 라인 텍스트 그리기
                const lineHeight = fontSize * 1.3;
                const totalTextHeight = lines.length * lineHeight;
                const startY = boxY + (boxHeight - totalTextHeight) / 2;
                lines.forEach((line, index)=>{
                    const lineY = startY + index * lineHeight;
                    const lineX = boxX + boxWidth / 2;
                    ctx.fillText(line, lineX, lineY);
                });
            } else if (selection.isTranslating) {
                // 번역 중 표시 (화면 좌표계에서 직접 그리기)
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(selection.startX, selection.startY, selection.width, selection.height);
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2;
                ctx.strokeRect(selection.startX, selection.startY, selection.width, selection.height);
                ctx.fillStyle = 'white' // 번역 중 텍스트도 흰색으로 변경
                ;
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('번역 중...', selection.startX + selection.width / 2, selection.startY + selection.height / 2);
            }
        });
        // 현재 선택 중인 영역 그리기 (화면 좌표계에서 직접 그리기)
        if (currentSelection) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.setLineDash([
                5,
                5
            ]);
            ctx.strokeRect(currentSelection.startX, currentSelection.startY, currentSelection.width, currentSelection.height);
            ctx.setLineDash([]);
        }
    }, [
        image,
        selections,
        currentSelection,
        scale,
        hoveredSelection
    ]);
    // 캔버스 업데이트
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        drawCanvas();
    }, [
        drawCanvas
    ]);
    // 마우스 이벤트 핸들러들
    const handleMouseDown = (e)=>{
        if (!image) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // 화면 좌표를 캔버스 좌표로 변환 (캔버스와 화면이 동일한 크기이므로 직접 사용)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 기존 선택 영역 클릭 확인 (역순으로 체크하여 최신 영역 우선)
        for(let i = selections.length - 1; i >= 0; i--){
            const selection = selections[i];
            if (x >= selection.startX && x <= selection.startX + selection.width && y >= selection.startY && y <= selection.startY + selection.height) {
                // 기존 영역 클릭 시 삭제
                setSelections((prev)=>prev.filter((sel)=>sel.id !== selection.id));
                return;
            }
        }
        // 새로운 영역 선택 시작
        setIsDrawing(true);
        setStartPoint({
            x,
            y
        });
        setCurrentSelection({
            id: `selection-${Date.now()}`,
            startX: x,
            startY: y,
            width: 0,
            height: 0,
            isTranslating: false,
            translatedText: ''
        });
    };
    const handleMouseMove = (e)=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // 화면 좌표를 캔버스 좌표로 변환 (캔버스와 화면이 동일한 크기이므로 직접 사용)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 호버된 선택 영역 찾기
        let hoveredId = null;
        for(let i = selections.length - 1; i >= 0; i--){
            const selection = selections[i];
            if (x >= selection.startX && x <= selection.startX + selection.width && y >= selection.startY && y <= selection.startY + selection.height) {
                hoveredId = selection.id;
                break;
            }
        }
        setHoveredSelection(hoveredId);
        // 드래그 중인 경우
        if (isDrawing && startPoint && image) {
            const currentX = x;
            const currentY = y;
            const width = currentX - startPoint.x;
            const height = currentY - startPoint.y;
            setCurrentSelection((prev)=>prev ? {
                    ...prev,
                    width: Math.abs(width),
                    height: Math.abs(height),
                    startX: width < 0 ? currentX : startPoint.x,
                    startY: height < 0 ? currentY : startPoint.y
                } : null);
            // 캔버스 다시 그리기
            drawCanvas();
        }
    };
    // 우클릭 컨텍스트 메뉴
    const handleContextMenu = (e)=>{
        e.preventDefault();
        if (!image) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // 화면 좌표를 캔버스 좌표로 변환 (캔버스와 화면이 동일한 크기이므로 직접 사용)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 우클릭한 위치의 선택 영역 찾기
        for(let i = selections.length - 1; i >= 0; i--){
            const selection = selections[i];
            if (x >= selection.startX && x <= selection.startX + selection.width && y >= selection.startY && y <= selection.startY + selection.height) {
                // 해당 영역 삭제
                setSelections((prev)=>prev.filter((sel)=>sel.id !== selection.id));
                return;
            }
        }
    };
    const handleMouseUp = async ()=>{
        if (!isDrawing || !currentSelection) return;
        setIsDrawing(false);
        // 너무 작은 선택 영역은 무시
        if (Math.abs(currentSelection.width) < 20 || Math.abs(currentSelection.height) < 20) {
            setCurrentSelection(null);
            return;
        }
        // 음수 크기 정규화
        const normalizedSelection = {
            ...currentSelection,
            startX: currentSelection.width < 0 ? currentSelection.startX + currentSelection.width : currentSelection.startX,
            startY: currentSelection.height < 0 ? currentSelection.startY + currentSelection.height : currentSelection.startY,
            width: Math.abs(currentSelection.width),
            height: Math.abs(currentSelection.height),
            isTranslating: true
        };
        // 선택 영역을 목록에 추가
        setSelections((prev)=>[
                ...prev,
                normalizedSelection
            ]);
        setCurrentSelection(null);
        // OCR 및 번역 수행
        await translateSelectedArea(normalizedSelection);
    };
    // 선택된 영역 번역
    const translateSelectedArea = async (selection)=>{
        try {
            // 선택된 영역의 이미지 데이터 추출
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx || !image) return;
            // 화면 좌표를 원본 이미지 좌표로 변환
            const originalX = selection.startX * scale.x;
            const originalY = selection.startY * scale.y;
            const originalWidth = selection.width * scale.x;
            const originalHeight = selection.height * scale.y;
            canvas.width = originalWidth;
            canvas.height = originalHeight;
            // 선택된 영역만 캔버스에 그리기 (원본 이미지에서 해당 영역 추출)
            ctx.drawImage(image, originalX, originalY, originalWidth, originalHeight, 0, 0, originalWidth, originalHeight);
            // 캔버스를 Blob으로 변환
            const blob = await new Promise((resolve)=>{
                canvas.toBlob((blob)=>resolve(blob), 'image/png');
            });
            // FormData로 API 호출
            const formData = new FormData();
            formData.append('image', blob, 'selection.png');
            formData.append('ocrOnly', 'true');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success && result.translatedText) {
                // 번역 완료 - 선택 영역 업데이트
                setSelections((prev)=>prev.map((sel)=>sel.id === selection.id ? {
                            ...sel,
                            translatedText: result.translatedText,
                            isTranslating: false
                        } : sel));
            } else {
                // 번역 실패 - 선택 영역 제거
                setSelections((prev)=>prev.filter((sel)=>sel.id !== selection.id));
            }
        } catch (error) {
            console.error('Translation error:', error);
            setSelections((prev)=>prev.filter((sel)=>sel.id !== selection.id));
        }
    };
    // 번역된 영역이 변경될 때마다 자동으로 번역된 이미지 생성
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const autoGenerateTranslatedImage = async ()=>{
            // 번역된 영역이 있고, 모든 번역이 완료된 경우에만 실행
            const translatedSelections = selections.filter((sel)=>sel.translatedText && !sel.isTranslating);
            if (translatedSelections.length === 0) return;
            // 번역 중인 영역이 있으면 대기
            if (selections.some((sel)=>sel.isTranslating)) return;
            // 자동으로 번역된 이미지 생성
            try {
                const translatedImageUrl = await generateTranslatedImage();
                if (translatedImageUrl && translatedImageUrl !== lastTranslatedImageUrl) {
                    setLastTranslatedImageUrl(translatedImageUrl);
                    // 상위 컴포넌트에 자동으로 전달
                    onTranslationComplete(translatedImageUrl);
                }
            } catch (error) {
                console.error('Auto translation generation error:', error);
            }
        };
        autoGenerateTranslatedImage();
    }, [
        selections,
        onTranslationComplete,
        lastTranslatedImageUrl
    ]);
    // 번역된 이미지 생성 함수 (handleComplete에서 분리)
    const generateTranslatedImage = async ()=>{
        if (selections.length === 0) return null;
        if (selections.some((sel)=>sel.isTranslating)) return null;
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx || !image) return null;
            canvas.width = image.width;
            canvas.height = image.height;
            // 원본 이미지 그리기
            ctx.drawImage(image, 0, 0);
            // 번역된 텍스트들 그리기
            selections.forEach((selection)=>{
                if (selection.translatedText) {
                    // 화면 좌표를 원본 이미지 좌표로 변환
                    const realX = selection.startX * scale.x;
                    const realY = selection.startY * scale.y;
                    const realWidth = selection.width * scale.x;
                    const realHeight = selection.height * scale.y;
                    // 반투명 검은색 배경 (70% 투명도)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(realX, realY, realWidth, realHeight);
                    // 경계선
                    ctx.strokeStyle = '#333333';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(realX, realY, realWidth, realHeight);
                    // 폰트 사이즈를 영역에 맞게 동적 계산
                    const maxTextWidth = realWidth * 0.9;
                    const maxTextHeight = realHeight * 0.9;
                    // 텍스트 줄바꿈 처리
                    const words = selection.translatedText.split(' ');
                    // 폰트 사이즈를 찾기 위한 계산
                    const minFontSize = 8;
                    const maxFontSize = Math.min(realHeight * 0.5, 60);
                    let bestFontSize = minFontSize;
                    // 최적 폰트 사이즈 찾기
                    for(let testSize = minFontSize; testSize <= maxFontSize; testSize += 2){
                        ctx.font = `bold ${testSize}px Arial, sans-serif`;
                        // 텍스트 줄바꿈 테스트
                        const lines = [];
                        let currentLine = '';
                        for (const word of words){
                            const testLine = currentLine ? `${currentLine} ${word}` : word;
                            const testWidth = ctx.measureText(testLine).width;
                            if (testWidth <= maxTextWidth) {
                                currentLine = testLine;
                            } else {
                                if (currentLine) {
                                    lines.push(currentLine);
                                    currentLine = word;
                                } else {
                                    lines.push(word);
                                }
                            }
                        }
                        if (currentLine) lines.push(currentLine);
                        // 총 높이 계산
                        const lineHeight = testSize * 1.3;
                        const totalHeight = lines.length * lineHeight;
                        // 텍스트가 영역에 들어가는지 확인
                        if (totalHeight <= maxTextHeight) {
                            bestFontSize = testSize;
                        } else {
                            break;
                        }
                    }
                    // 최종 폰트 사이즈 적용
                    const fontSize = Math.max(bestFontSize, minFontSize);
                    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    const centerX = realX + realWidth / 2;
                    // 최종 텍스트 줄바꿈
                    const lines = [];
                    let currentLine = '';
                    for (const word of words){
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        const testWidth = ctx.measureText(testLine).width;
                        if (testWidth <= maxTextWidth) {
                            currentLine = testLine;
                        } else {
                            if (currentLine) {
                                lines.push(currentLine);
                                currentLine = word;
                            } else {
                                lines.push(word);
                            }
                        }
                    }
                    if (currentLine) lines.push(currentLine);
                    const lineHeight = fontSize * 1.3;
                    const totalTextHeight = lines.length * lineHeight;
                    const startY = realY + (realHeight - totalTextHeight) / 2;
                    lines.forEach((line, index)=>{
                        const lineY = startY + index * lineHeight;
                        ctx.fillText(line, centerX, lineY);
                    });
                }
            });
            // 캔버스를 Blob으로 변환
            const blob = await new Promise((resolve)=>{
                canvas.toBlob((blob)=>resolve(blob), 'image/jpeg', 0.85);
            });
            // Cloudinary 업로드
            const formData = new FormData();
            formData.append('image', blob, 'translated.jpg');
            formData.append('translateImage', 'false') // 이미 번역된 이미지
            ;
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                return result.imageUrl;
            }
            return null;
        } catch (error) {
            console.error('Generate translated image error:', error);
            return null;
        }
    };
    // 완료된 이미지 생성
    const handleComplete = async ()=>{
        if (selections.length === 0) {
            return;
        }
        if (selections.some((sel)=>sel.isTranslating)) {
            return;
        }
        setIsTranslating(true);
        try {
            const translatedImageUrl = await generateTranslatedImage();
            if (translatedImageUrl) {
                setLastTranslatedImageUrl(translatedImageUrl);
                onTranslationComplete(translatedImageUrl);
            }
        } catch (error) {
            console.error('Complete error:', error);
        } finally{
            setIsTranslating(false);
        }
    };
    // 선택 영역 삭제
    const handleClearSelections = ()=>{
        setSelections([]);
        setCurrentSelection(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-sm border",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold",
                            children: "이미지 번역 편집기"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ImageTranslator.tsx",
                            lineNumber: 656,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-gray-600 space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "마우스로 드래그하여 번역할 텍스트 영역을 선택하세요"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ImageTranslator.tsx",
                                    lineNumber: 658,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs",
                                    children: [
                                        "💡 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "팁:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ImageTranslator.tsx",
                                            lineNumber: 660,
                                            columnNumber: 20
                                        }, this),
                                        " 선택된 영역을 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-red-600",
                                            children: "클릭"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ImageTranslator.tsx",
                                            lineNumber: 660,
                                            columnNumber: 48
                                        }, this),
                                        "하거나 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-red-600",
                                            children: "우클릭"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ImageTranslator.tsx",
                                            lineNumber: 660,
                                            columnNumber: 92
                                        }, this),
                                        "하면 개별 삭제됩니다"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ImageTranslator.tsx",
                                    lineNumber: 659,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ImageTranslator.tsx",
                            lineNumber: 657,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                    ref: canvasRef,
                                    onMouseDown: handleMouseDown,
                                    onMouseMove: handleMouseMove,
                                    onMouseUp: handleMouseUp,
                                    onContextMenu: handleContextMenu,
                                    className: "cursor-crosshair block w-full border border-gray-300 rounded-lg"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ImageTranslator.tsx",
                                    lineNumber: 666,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ImageTranslator.tsx",
                                lineNumber: 665,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ImageTranslator.tsx",
                            lineNumber: 664,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleClearSelections,
                                    disabled: selections.length === 0,
                                    className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                    children: "선택 초기화"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ImageTranslator.tsx",
                                    lineNumber: 678,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleComplete,
                                    disabled: selections.length === 0 || isTranslating,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                    children: isTranslating ? '처리 중...' : '번역 완료'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ImageTranslator.tsx",
                                    lineNumber: 685,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onCancel,
                                    className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
                                    children: "취소"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ImageTranslator.tsx",
                                    lineNumber: 692,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ImageTranslator.tsx",
                            lineNumber: 677,
                            columnNumber: 13
                        }, this),
                        selections.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-gray-600",
                            children: [
                                "선택된 영역: ",
                                selections.length,
                                "개",
                                selections.filter((s)=>s.translatedText).length > 0 && ` (번역 완료: ${selections.filter((s)=>s.translatedText).length}개)`
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ImageTranslator.tsx",
                            lineNumber: 701,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ImageTranslator.tsx",
                    lineNumber: 655,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ImageTranslator.tsx",
                lineNumber: 654,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ImageTranslator.tsx",
            lineNumber: 653,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ImageTranslator.tsx",
        lineNumber: 652,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=src_components_ImageTranslator_tsx_47168b9a._.js.map