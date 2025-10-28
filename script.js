class MouseTester {
    constructor() {
        this.clickCount = 0;
        this.clickTimer = null;
        this.timeLeft = 0;
        this.isClickTestActive = false;
        
        this.sensorData = {
            lastX: 0,
            lastY: 0,
            lastTime: 0,
            totalDistance: 0,
            currentSpeed: 0
        };

        this.testResults = {
            buttons: {
                'left-btn': false,
                'right-btn': false,
                'middle-btn': false,
                'back-btn': false,
                'forward-btn': false
            },
            clicks: 0,
            sensor: {
                maxSpeed: 0,
                totalDistance: 0
            }
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const timerInput = document.getElementById('timer');
        timerInput.addEventListener('input', (e) => {
            this.handleTimerInput(e);
        });

        timerInput.addEventListener('change', (e) => {
            this.handleTimerChange(e);
        });

        document.addEventListener('mousedown', (e) => {
            this.handleMouseButtonPress(e);
            this.preventDefaultForBrowserActions(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handleMouseButtonRelease(e);
            this.preventDefaultForBrowserActions(e);
        });

        document.addEventListener('wheel', (e) => {
            this.handleScrollTest(e);
        });

        const clickTestArea = document.getElementById('clickTestArea');
        const startClickTestBtn = document.getElementById('startClickTest');

        clickTestArea.addEventListener('click', (e) => {
            if (this.isClickTestActive) {
                this.handleClickTest();
            }
        });

        startClickTestBtn.addEventListener('click', () => {
            this.startClickTest();
        });

        const sensorTestArea = document.getElementById('sensorTestArea');
        sensorTestArea.addEventListener('mousemove', (e) => {
            this.handleSensorTest(e);
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        document.addEventListener('auxclick', (e) => {
            this.preventDefaultForBrowserActions(e);
        });
    }

    preventDefaultForBrowserActions(e) {
        if (e.button === 3 || e.button === 4) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }

    handleTimerInput(e) {
        const input = e.target;
        let value = parseInt(input.value);
        
        if (value < 1) {
            input.value = 1;
            value = 1;
        } else if (value > 100) {
            input.value = 100;
            value = 100;
        }
        
        this.restartTestWithNewTime(value);
    }

    handleTimerChange(e) {
        const input = e.target;
        let value = parseInt(input.value);
        
        if (isNaN(value) || value < 1) {
            input.value = 1;
            value = 1;
        } else if (value > 100) {
            input.value = 100;
            value = 100;
        }
        
        this.restartTestWithNewTime(value);
    }

    restartTestWithNewTime(newTime) {
        if (this.isClickTestActive) {
            clearInterval(this.clickTimer);
            this.isClickTestActive = false;
        }
        
        this.clickCount = 0;
        this.timeLeft = newTime;
        
        document.getElementById('clickCount').textContent = '0';
        document.getElementById('timerDisplay').textContent = `${newTime}s`;
        
        const startButton = document.getElementById('startClickTest');
        startButton.disabled = false;
        startButton.textContent = 'Iniciar Teste';
        
        const clickTestArea = document.getElementById('clickTestArea');
        clickTestArea.classList.remove('active');
    }

    handleMouseButtonPress(e) {
        this.preventDefaultForBrowserActions(e);
        
        console.log('Botão pressionado:', e.button);
        
        let btnId = '';
        let illusBtnId = '';

        switch(e.button) {
            case 0: // Botao esquerdo
                btnId = 'left-btn';
                illusBtnId = 'illus-left-btn';
                break;
            case 1: // Botao do meio (scroll)
                btnId = 'middle-btn';
                illusBtnId = 'illus-middle-btn';
                break;
            case 2: // Botao direito
                btnId = 'right-btn';
                illusBtnId = 'illus-right-btn';
                break;
            case 3: // Botao lateral FRENTE (normalmente o mais distante)
                btnId = 'forward-btn';
                illusBtnId = 'illus-forward-btn';
                break;
            case 4: // Botao lateral TRAS (normalmente o mais proximo)
                btnId = 'back-btn';
                illusBtnId = 'illus-back-btn';
                break;
        }

        if (btnId && illusBtnId) {
            console.log(`Mapeado: ${btnId} para botão físico ${e.button}`);
            this.highlightIllustrationButton(illusBtnId);
            this.testResults.buttons[btnId] = true;
            this.updateResults();
        }
    }

    handleMouseButtonRelease(e) {
        this.preventDefaultForBrowserActions(e);
        
        let illusBtnId = '';

        switch(e.button) {
            case 0:
                illusBtnId = 'illus-left-btn';
                break;
            case 1:
                illusBtnId = 'illus-middle-btn';
                break;
            case 2:
                illusBtnId = 'illus-right-btn';
                break;
            case 3: // Botao lateral FRENTE
                illusBtnId = 'illus-forward-btn';
                break;
            case 4: // Botao lateral TRAS
                illusBtnId = 'illus-back-btn';
                break;
        }

        if (illusBtnId) {
            this.unhighlightIllustrationButton(illusBtnId);
        }
    }

    highlightIllustrationButton(buttonId) {
        const element = document.getElementById(buttonId);
        if (element) {
            element.classList.add('active');
            element.style.transform = 'translateY(2px)';
            if (buttonId === 'illus-back-btn' || buttonId === 'illus-forward-btn') {
                element.style.transform = 'translateX(2px)';
            }
        }
    }

    unhighlightIllustrationButton(buttonId) {
        const element = document.getElementById(buttonId);
        if (element) {
            element.classList.remove('active');
            element.style.transform = '';
        }
    }

    handleScrollTest(e) {
        const illusBtnId = 'illus-middle-btn';
        const element = document.getElementById(illusBtnId);
        
        if (element) {
            element.classList.add('active');
            setTimeout(() => {
                element.classList.remove('active');
            }, 200);
        }

        this.testResults.buttons['middle-btn'] = true;
        this.updateResults();
    }

    startClickTest() {
        if (this.isClickTestActive) return;
        
        const timerInput = document.getElementById('timer');
        let totalTime = parseInt(timerInput.value) || 10;
        
        if (totalTime < 1) {
            totalTime = 1;
            timerInput.value = 1;
        } else if (totalTime > 100) {
            totalTime = 100;
            timerInput.value = 100;
        }
        
        this.clickCount = 0;
        this.timeLeft = totalTime;
        this.isClickTestActive = true;
        
        const clickTestArea = document.getElementById('clickTestArea');
        const clickCountElement = document.getElementById('clickCount');
        const timerDisplay = document.getElementById('timerDisplay');
        const startButton = document.getElementById('startClickTest');
        
        clickTestArea.classList.add('active');
        clickCountElement.textContent = '0';
        timerDisplay.textContent = `${this.timeLeft}s`;
        startButton.disabled = true;
        startButton.textContent = 'Teste em Andamento...';
        
        this.clickTimer = setInterval(() => {
            this.timeLeft--;
            timerDisplay.textContent = `${this.timeLeft}s`;
            
            if (this.timeLeft <= 0) {
                this.endClickTest();
            }
        }, 1000);
    }

    handleClickTest() {
        if (!this.isClickTestActive) return;
        
        this.clickCount++;
        document.getElementById('clickCount').textContent = this.clickCount;
        
        const clickTestArea = document.getElementById('clickTestArea');
        clickTestArea.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickTestArea.style.transform = 'scale(1)';
        }, 100);
    }

    endClickTest() {
        clearInterval(this.clickTimer);
        this.isClickTestActive = false;
        
        const clickTestArea = document.getElementById('clickTestArea');
        const startButton = document.getElementById('startClickTest');
        
        clickTestArea.classList.remove('active');
        startButton.disabled = false;
        startButton.textContent = 'Iniciar Teste';
        
        this.testResults.clicks = this.clickCount;
        this.updateResults();
    }

    handleSensorTest(e) {
        const tracker = document.querySelector('.cursor-tracker');
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        tracker.style.left = x + 'px';
        tracker.style.top = y + 'px';
        
        const currentTime = Date.now();
        if (this.sensorData.lastTime > 0) {
            const timeDiff = (currentTime - this.sensorData.lastTime) / 1000;
            const distance = Math.sqrt(
                Math.pow(x - this.sensorData.lastX, 2) + 
                Math.pow(y - this.sensorData.lastY, 2)
            );
            
            this.sensorData.totalDistance += distance;
            this.sensorData.currentSpeed = timeDiff > 0 ? distance / timeDiff : 0;
            
            this.testResults.sensor.maxSpeed = Math.max(
                this.testResults.sensor.maxSpeed, 
                this.sensorData.currentSpeed
            );
            this.testResults.sensor.totalDistance = this.sensorData.totalDistance;
            
            document.getElementById('speed').textContent = Math.round(this.sensorData.currentSpeed);
            document.getElementById('distance').textContent = Math.round(this.sensorData.totalDistance);
        }
        
        this.sensorData.lastX = x;
        this.sensorData.lastY = y;
        this.sensorData.lastTime = currentTime;
    }

    updateResults() {
        const buttonsTested = Object.values(this.testResults.buttons).filter(Boolean).length;
        
        if (buttonsTested === 5 && this.testResults.clicks > 0) {
            this.displayDetailedResults();
        } else {
            this.displayProgress();
        }
    }

    displayProgress() {
        const resultsContent = document.getElementById('resultsContent');
        const buttonsTested = Object.values(this.testResults.buttons).filter(Boolean).length;
        
        resultsContent.innerHTML = `
            <div style="width: 100%;">
                <div style="margin-bottom: 15px;">
                    <strong>Progresso:</strong> ${buttonsTested}/5 botoes testados
                    ${this.testResults.clicks > 0 ? ` | ${this.testResults.clicks} cliques` : ''}
                </div>
                <div class="warning-message">
                    Complete todos os testes para analise completa
                </div>
            </div>
        `;
    }

    displayDetailedResults() {
        const resultsContent = document.getElementById('resultsContent');
        const buttonsTested = Object.values(this.testResults.buttons).filter(Boolean).length;
        const timerValue = parseInt(document.getElementById('timer').value) || 10;
        const cps = (this.testResults.clicks / timerValue).toFixed(1);
        
        resultsContent.innerHTML = `
            <div style="width: 100%;">
                <div class="result-grid">
                    <div class="result-item">
                        <h3>Botoes Testados</h3>
                        <div class="result-value">${buttonsTested}/5</div>
                        <div class="result-subtext">Todos os botoes funcionando</div>
                    </div>
                    <div class="result-item">
                        <h3>Cliques Totais</h3>
                        <div class="result-value">${this.testResults.clicks}</div>
                        <div class="result-subtext">${cps} cliques/segundo (${timerValue}s)</div>
                    </div>
                    <div class="result-item">
                        <h3>Sensor</h3>
                        <div>Velocidade Max: <strong>${Math.round(this.testResults.sensor.maxSpeed)} px/s</strong></div>
                        <div>Distancia Total: <strong>${Math.round(this.testResults.sensor.totalDistance)} px</strong></div>
                    </div>
                </div>
                <div class="success-message">
                    Todos os testes realizados com sucesso!
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MouseTester();
});