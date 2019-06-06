"use strict";
/**Classe utilizada para definir os Processos */
var Process = /** @class */ (function () {
    function Process(name, quantum) {
        this.name = name;
        this.quantum = quantum;
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
     * Executa o primeiro processo da fila de executando
     */
    Actions.prototype.executeProcess = function () {
        var process = EXECUTING_ROW[0];
        var timeToFinish = process.quantum - QUANTUM;
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
    return Actions;
}());
/**Quantum máximo gasto por cada processo antes de um troca de contexto*/
var QUANTUM = 2;
/**Quantum gasto pela troca de contexto */
var CONTEXT_CHANGE = 1;
/**Processo do teclado */
var KEYBOARD = new Process("keyboard", 5);
/**Processo do monitor */
var MONITOR = new Process("monitor", 8);
/**Fila de processos prontos */
var READY_ROW = new Array();
/**Fila de processos em execução */
var EXECUTING_ROW = new Array();
/**Fila de processos em espera */
var AWAIT_ROW = new Array();
/**Instância das ações */
var actions = new Actions();
function Main() {
    //Insere na fila de espera
    actions.moveToRow(AWAIT_ROW, KEYBOARD);
    actions.moveToRow(AWAIT_ROW, MONITOR);
    //Variáveis auxiliares
    var process = new Process("", 0);
    var resultProcess = new Process("", 0);
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
        //Executa o processo
        if (actions.executeProcess() == 0) {
            //Caso o processo tenha terminado
            resultProcess = actions.removeRow(EXECUTING_ROW);
            actions.moveToRow(READY_ROW, resultProcess);
            console.log("Processo " + resultProcess.name + " finalizado e movido para a fila de prontos");
        }
        else {
            //Caso o processo não tenha terminado
            resultProcess = actions.removeRow(EXECUTING_ROW);
            actions.moveToRow(AWAIT_ROW, resultProcess);
            console.log("Processo " + resultProcess.name + " parado e movido para a fila de espera");
        }
    }
    console.log("Quantum gasto pelo sistema: " + actions.totalTime);
    return '';
}
document.body.innerHTML = Main();
//# sourceMappingURL=roundRobin.js.map