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
     * Executa o primeiro processo da fila de executando
     */
    resolveProcess(): number {
        let process = EXECUTING_ROW[0];

        console.log("Processo, " + process.name + " sendo executado");
        this.setTimeToExecute(TIME_TO_EXECUTE);

        let timeToFinish = process.quantum - QUANTUM;

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
    setTimeToExecute(ms: number) {
        let start = Date.now();
        let countInterruption = 0;

        while (true) {
            let clock = (Date.now() - start);
            if (clock >= ms)
                break;
        }
    }

    /**
     * Resolve um processo, verifica se o processo terminou e move para uma determinada fila
     * @param resultProcess Instância do processo
     */
    execute(resultProcess: Process) {
        if (this.resolveProcess() == 0) {
            //Caso o processo tenha terminado
            resultProcess = this.removeRow(EXECUTING_ROW);
            this.moveToRow(READY_ROW, resultProcess);
            console.log("Processo " + resultProcess.name + " finalizado e movido para a fila de prontos");
        } else {
            //Caso o processo não tenha terminado
            resultProcess = this.removeRow(EXECUTING_ROW);
            this.moveToRow(AWAIT_ROW, resultProcess);
            console.log("Processo " + resultProcess.name + " parado e movido para a fila de espera");
        }
    }

}

/**Quantum máximo gasto por cada processo antes de um troca de contexto*/
const QUANTUM = 2;

/**Quantum gasto pela troca de contexto */
const CONTEXT_CHANGE = 1;

/**Tempo de execução de cada função em milisegundos */
const TIME_TO_EXECUTE = 2000;

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
        if (!actions.compareProcesses(process, resultProcess)) {
            actions.changeContext();
            console.log("Troca de contexto realizada");
        }

        //Executa um processo e verifica para qual fila irá mandar o processo
        actions.execute(resultProcess);
    }

    console.log("Quantum gasto pelo sistema: " + actions.totalTime);
    return '';
}

document.body.innerHTML = Main();