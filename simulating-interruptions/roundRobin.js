/**Classe utilizada para definir os Processos */
var Process = /** @class */ (function () {
    function Process(name, quantum, priority) {
        this.name = name;
        this.quantum = quantum;
        this.priority = priority;
    }
    return Process;
}());
/**Classe de ações utilizadas pelo algoritmo */
var Actions = /** @class */ (function () {
    function Actions() {
        /**Total gasto pelo sistema para executar os processos*/
        this.totalTime = 0;
    }
    /**
     * Move um processo para a fila
     * @param row Fila para qual o processo será movido
     * @param process Processo que será movido para a fila
     */
    Actions.prototype.moveToRow = function (row, process) {
        row.push(process);
    };
    /**
     * Remove o primeiro elemento da fila
     * @param row Fila da qual o processo será removido
     */
    Actions.prototype.removeRow = function (row) {
        return row.splice(0, 1)[0];
    };
    /**
     * Verifica se existe algum processo na fila de espera
     */
    Actions.prototype.verifyAwaitRow = function () {
        if (AWAIT_ROW.length > 0)
            return true;
        return false;
    };
    /**
     * Executa uma troca de contexto
     */
    Actions.prototype.changeContext = function () {
        this.totalTime += CONTEXT_CHANGE;
        console.log("Troca de contexto realizada");
    };
    /**
     * Compara dois processo, retornando true caso sejam iguais
     * @param process Processo que foi removido da fila de espera
     * @param resultProcess Processo que estava sendo executado anteriormente
     */
    Actions.prototype.compareProcesses = function (process, resultProcess) {
        if (resultProcess.name != process.name)
            return false;
        return true;
    };
    /**
     * Cria um espaço de tempo para simular a execução de um processo
     * @param ms Tempo de execução em milisegundos
     */
    Actions.prototype.setTimeToResolve = function (ms) {
        var start = Date.now();
        while (true) {
            var clock = (Date.now() - start);
            if (clock >= ms)
                break;
        }
    };
    /**
     * Executa o primeiro processo da fila de executando,
     * simula e executa interrupções
     */
    Actions.prototype.resolveProcess = function () {
        var process = EXECUTING_ROW[0];
        var interruptions = new Array();
        console.log("Processo " + process.name + " sendo executado");
        this.setTimeToResolve(TIME_TO_EXECUTE);
        var timeToFinish = process.quantum;
        for (var i = 1; i <= QUANTUM; i++) {
            timeToFinish--;
            this.executeInterruption(this.simulateInterruption());
        }
        //Se executou o processo completamente
        if (timeToFinish <= 0) {
            this.totalTime += process.quantum;
            process.quantum = 0;
            return process.quantum;
        }
        process.quantum = timeToFinish;
        this.totalTime += QUANTUM;
        return timeToFinish;
    };
    /**
     * Simula uma interrupção. Verifica se há processos na fila de espera,
     * e aleatóriamente pode escolher um processo e lançar a interrupação
     */
    Actions.prototype.simulateInterruption = function () {
        // Verifica se há processos na fila e lança interrupções
        if (this.verifyAwaitRow()) {
            var randomProcess = AWAIT_ROW[Math.floor(Math.random() * AWAIT_ROW.length + 1)];
            if (randomProcess != undefined && !this.compareProcesses(EXECUTING_ROW[0], randomProcess)) {
                console.log("Interrupção vinda do processo " + randomProcess.name);
                return randomProcess;
            }
        }
        return new Process('', 0, 0);
    };
    /**Resolve uma interrupção */
    Actions.prototype.resolveInterruption = function () {
        var process = EXECUTING_ROW[0];
        console.log("Processo " + process.name + " sendo executado");
        this.setTimeToResolve(TIME_TO_EXECUTE);
        var timeToFinish = process.quantum - QUANTUM;
        //Se executou o processo completamente
        if (timeToFinish <= 0) {
            this.totalTime += process.quantum;
            process.quantum = 0;
        }
        else {
            process.quantum = timeToFinish;
            this.totalTime += QUANTUM;
        }
        process = this.removeRow(EXECUTING_ROW);
        if (process.quantum == 0) {
            //Caso o processo tenha terminado
            this.moveToRow(READY_ROW, process);
            console.log("Processo " + process.name + " finalizado e movido para a fila de prontos");
        }
        else {
            //Caso o processo não tenha terminado
            this.moveToRow(AWAIT_ROW, process);
            console.log("Processo " + process.name + " parado e movido para a fila de espera");
        }
    };
    /**
     * Verifica a prioridade do processo, caso seja de prioridade mais alta do que o processo atual
     * executa as trocas entre as filas, as trocas de contexto e resolve a interrupção
     */
    Actions.prototype.executeInterruption = function (process) {
        if (process.name != '' && EXECUTING_ROW[0].priority > process.priority) {
            var stopedProcess = this.removeRow(EXECUTING_ROW);
            this.moveToRow(STOPED_ROW, stopedProcess);
            console.log("Processo " + stopedProcess.name + " parado forçadamente e movido para a fila de espera");
            this.changeContext();
            this.moveToRow(EXECUTING_ROW, process);
            this.resolveInterruption();
            stopedProcess = this.removeRow(STOPED_ROW);
            console.log("Processo " + stopedProcess.name + " retomou a fila de executando");
            this.moveToRow(EXECUTING_ROW, stopedProcess);
            this.changeContext();
            console.log("Processo " + stopedProcess.name + " sendo executado");
        }
    };
    /**
     * Resolve um processo, verifica se o processo terminou e move para uma determinada fila
     * @param process Instância do processo
     */
    Actions.prototype.execute = function (process) {
        if (this.resolveProcess() == 0) {
            //Caso o processo tenha terminado
            process = this.removeRow(EXECUTING_ROW);
            this.moveToRow(READY_ROW, process);
            console.log("Processo " + process.name + " finalizado e movido para a fila de prontos");
        }
        else {
            //Caso o processo não tenha terminado
            process = this.removeRow(EXECUTING_ROW);
            this.moveToRow(AWAIT_ROW, process);
            console.log("Processo " + process.name + " parado e movido para a fila de espera");
        }
    };
    return Actions;
}());
/**Quantum máximo gasto por cada processo antes de um troca de contexto*/
var QUANTUM = 2;
/**Quantum gasto pela troca de contexto */
var CONTEXT_CHANGE = 1;
/**Tempo de execução de cada função em milisegundos */
var TIME_TO_EXECUTE = 2000; //5000;
/**Processo do teclado */
var KEYBOARD = new Process("keyboard", 5, 1);
/**Processo do monitor */
var MONITOR = new Process("monitor", 8, 0);
/**Processo da rede de comunicação tx */
var COMMUNICATION_TX = new Process("TX communication", 15, 2);
/**Processo da rede de comunicação rx */
var COMMUNICATION_RX = new Process("RX communication", 14, 2);
/**Fila de processos prontos */
var READY_ROW = new Array();
/**Fila de processos em execução */
var EXECUTING_ROW = new Array();
/**Fila de processos em espera */
var AWAIT_ROW = new Array();
/**Fila de processos parados */
var STOPED_ROW = new Array();
/**Instância das ações */
var actions = new Actions();
function Main() {
    //Insere na fila de espera
    actions.moveToRow(AWAIT_ROW, KEYBOARD);
    actions.moveToRow(AWAIT_ROW, MONITOR);
    actions.moveToRow(AWAIT_ROW, COMMUNICATION_TX);
    actions.moveToRow(AWAIT_ROW, COMMUNICATION_RX);
    //Variáveis auxiliares
    var process = new Process("", 0, 0);
    var resultProcess = new Process("", 0, 0);
    //Executa enquanto houver processo na fila de espera
    while (actions.verifyAwaitRow()) {
        //Remove da fila de Espera e move para fila de execução
        process = actions.removeRow(AWAIT_ROW);
        actions.moveToRow(EXECUTING_ROW, process);
        console.log("Processo " + process.name + " entrou na fila de execução");
        //Troca de contexto caso o processo anterior não tenha sido executado
        //e seja o único na fila
        if (!actions.compareProcesses(process, resultProcess))
            actions.changeContext();
        //Executa um processo e verifica para qual fila irá mandar o processo
        actions.execute(resultProcess);
    }
    console.log("Quantum gasto pelo sistema: " + actions.totalTime);
    return '';
}
document.body.innerHTML = Main();
