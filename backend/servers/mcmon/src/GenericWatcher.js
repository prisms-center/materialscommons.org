class GenericWatcher {

    constructor() {
        this.table_name = null;
    }

    filter(delte) {
        return true;
    }

    action(delta) {
        console.log(delta);
    }

}

module.exports = GenericWatcher;