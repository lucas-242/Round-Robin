/**Classe utilizada para definir os Processos */
class Process {
    /**Nome do processo */
    name: string;

    /**Quantum necessário para a conclusão do processo */
    quantum: number;

    /**Prioridade do processo 
     * 0- Alta prioridade
     * 1- Média prioridade
     * 2- Baixa prioridade
    */
    priority: number;

    constructor(name: string, quantum: number, priority: number) {
        this.name = name;
        this.quantum = quantum;
        this.priority = priority
    }
}

/**Classe de ações utilizadas pelo algoritmo */
class Actions {

    /**Total gasto pelo sistema para executar os processos*/
    totalTime = 0;

    /**
     * Move um processo para a fila
     * @param row Fila para qual o processo será movido
     * @param process Processo que será movido para a fila
     */
    moveToRow(row: Array<Process>, process: Process): void {
        row.push(process);
    }

    /**
     * Remove o primeiro elemento da fila
     * @param row Fila da qual o processo será removido
     */
    removeRow(row: Array<Process>): Process {
        return row.splice(0, 1)[0];
    }

    /**
     * Verifica se existe algum processo na fila de espera
     */
    verifyAwaitRow(): boolean {
        if (AWAIT_ROW.length > 0)
            return true;

        return false;
    }

    /**
     * Executa uma troca de contexto
     */
    changeContext(): void {
        this.totalTime += CONTEXT_CHANGE;
        console.log("Troca de contexto realizada");
    }

    /**
     * Compara dois processo, retornando true caso sejam iguais
     * @param process Processo que foi removido da fila de espera
     * @param resultProcess Processo que estava sendo executado anteriormente
     */
    compareProcesses(process: Process, resultProcess: Process): boolean {
        if (resultProcess.name != process.name)
            return false;

        return true;
    }

    /**
     * Cria um espaço de tempo para simular a execução de um processo
     * @param ms Tempo de execução em milisegundos
     */
    setTimeToResolve(ms: number) {
        let start = Date.now();

        while (true) {
            let clock = (Date.now() - start);
            if (clock >= ms)
                break;
        }
    }

    /**
     * Executa o primeiro processo da fila de executando,
     * simula e executa interrupções
     */
    resolveProcess(): number {
        let process = EXECUTING_ROW[0];
        let interruptions = new Array<Process>();
        console.log("Processo " + process.name + " sendo executado");
        this.setTimeToResolve(TIME_TO_EXECUTE);

        let timeToFinish = process.quantum;

        for (let i = 1; i <= QUANTUM; i++) {
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
    }

    /**
     * Simula uma interrupção. Verifica se há processos na fila de espera, 
     * e aleatóriamente pode escolher um processo e lançar a interrupação
     */
    simulateInterruption(): Process {
        // Verifica se há processos na fila e lança interrupções
        if (this.verifyAwaitRow()) {
            let randomProcess = AWAIT_ROW[Math.floor(Math.random() * AWAIT_ROW.length + 1)];
            if (randomProcess != undefined && !this.compareProcesses(EXECUTING_ROW[0], randomProcess)) {
                console.log("Interrupção vinda do processo " + randomProcess.name);
                return randomProcess;
            }
        }

        return new Process('', 0, 0);
    }

    /**Resolve uma interrupção */
    resolveInterruption() {

        let process = EXECUTING_ROW[0];
        console.log("Processo " + process.name + " sendo executado");
        this.setTimeToResolve(TIME_TO_EXECUTE);

        let timeToFinish = process.quantum - QUANTUM;

        //Se executou o processo completamente
        if (timeToFinish <= 0) {
            this.totalTime += process.quantum;
            process.quantum = 0;
        } else {
            process.quantum = timeToFinish;
            this.totalTime += QUANTUM;
        }

        process = this.removeRow(EXECUTING_ROW);

        if (process.quantum == 0) {
            //Caso o processo tenha terminado
            this.moveToRow(READY_ROW, process);
            console.log("Processo " + process.name + " finalizado e movido para a fila de prontos");
        } else {
            //Caso o processo não tenha terminado
            this.moveToRow(AWAIT_ROW, process);
            console.log("Processo " + process.name + " parado e movido para a fila de espera");
        }
    }

    /**
     * Verifica a prioridade do processo, caso seja de prioridade mais alta do que o processo atual
     * executa as trocas entre as filas, as trocas de contexto e resolve a interrupção
     */
    executeInterruption(process: Process) {
        if (process.name != '' && EXECUTING_ROW[0].priority > process.priority) {

            let stopedProcess = this.removeRow(EXECUTING_ROW);
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
    }

    /**
     * Resolve um processo, verifica se o processo terminou e move para uma determinada fila
     * @param process Instância do processo
     */
    execute(process: Process) {
        if (this.resolveProcess() == 0) {
            //Caso o processo tenha terminado
            process = this.removeRow(EXECUTING_ROW);
            this.moveToRow(READY_ROW, process);
            console.log("Processo " + process.name + " finalizado e movido para a fila de prontos");
        } else {
            //Caso o processo não tenha terminado
            process = this.removeRow(EXECUTING_ROW);
            this.moveToRow(AWAIT_ROW, process);
            console.log("Processo " + process.name + " parado e movido para a fila de espera");
        }
    }

}

/**Quantum máximo gasto por cada processo antes de um troca de contexto*/
const QUANTUM = 2;

/**Quantum gasto pela troca de contexto */
const CONTEXT_CHANGE = 1;

/**Tempo de execução de cada função em milisegundos */
const TIME_TO_EXECUTE = 2000; //5000;

/**Processo do teclado */
const KEYBOARD = new Process("keyboard", 5, 1);
/**Processo do monitor */
const MONITOR = new Process("monitor", 8, 0);
/**Processo da rede de comunicação tx */
const COMMUNICATION_TX = new Process("TX communication", 15, 2);
/**Processo da rede de comunicação rx */
const COMMUNICATION_RX = new Process("RX communication", 14, 2);


/**Fila de processos prontos */
const READY_ROW = new Array<Process>();
/**Fila de processos em execução */
const EXECUTING_ROW = new Array<Process>();
/**Fila de processos em espera */
const AWAIT_ROW = new Array<Process>();
/**Fila de processos parados */
const STOPED_ROW = new Array<Process>();

/**Instância das ações */
let actions = new Actions();

function Main() {

    //Insere na fila de espera
    actions.moveToRow(AWAIT_ROW, KEYBOARD);
    actions.moveToRow(AWAIT_ROW, MONITOR);
    actions.moveToRow(AWAIT_ROW, COMMUNICATION_TX);
    actions.moveToRow(AWAIT_ROW, COMMUNICATION_RX);

    //Variáveis auxiliares
    let process = new Process("", 0, 0);
    let resultProcess = new Process("", 0, 0);

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