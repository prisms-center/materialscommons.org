// Get all attributes for a process
r.db('samplesdb').table("processes")
    .getAll("a8849140-e67c-4915-95fb-0735e3f908ec")
    .merge(function(proc) {
        return {
            attributes: r.db("samplesdb").table("attribute2process")
                .getAll(proc('id'), {index: "process_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .coerceTo("array")
        };
    });


// Get all attributes for a sample
// Assumption: A sample only ever has one active attribute set.
r.db('samplesdb').table("samples")
    .getAll("ecace6b3-1006-4718-b44f-f9ce3e350fcc")
    .eqJoin("id", r.db("samplesdb").table("sample2attribute_set"), {index: "sample_id"})
    .zip()
    .filter({current: true})
    .merge(function(aset) {
        return {
            attributes: r.db("samplesdb").table("attribute_set2attribute")
                .getAll(aset('attribute_set_id'), {index: "attribute_set_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .coerceTo("array")
        };
    });

// Get all attributes for all samples, including attribute history.
// Assumption: A sample only ever has one active attribute set.
r.db('samplesdb').table("samples")
    .eqJoin("id", r.db("samplesdb").table("sample2attribute_set"), {index: "sample_id"})
    .zip()
    .filter({current: true})
    .merge(function(aset) {
        return {
            attributes: r.db("samplesdb").table("attribute_set2attribute")
                .getAll(aset('attribute_set_id'), {index: "attribute_set_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .merge(function(attr) {
                    return {
                        history: r.db("samplesdb").table("best_measure_history")
                            .getAll(attr('id'), {index: "attribute_id"})
                            .merge(function(best) {
                                return {
                                    measurement: r.db("samplesdb").table("measurements").get(best('measurement_id')).default("")
                                };
                            })
                            .coerceTo("array")
                    };
                })
                .coerceTo("array")
        };
    });

// Get all attributes for all samples, including attribute history
// and attribute measurements.
r.db('samplesdb').table("samples")
    .eqJoin("id", r.db("samplesdb").table("sample2attribute_set"), {index: "sample_id"})
    .zip()
    .filter({current: true})
    .merge(function(aset) {
        return {
            attributes: r.db("samplesdb").table("attribute_set2attribute")
                .getAll(aset('attribute_set_id'), {index: "attribute_set_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .merge(function(attr) {
                    return {
                        best_measure: r.db("samplesdb").table("measurements").get(attr('best_measure_id')),
                        history: r.db("samplesdb").table("best_measure_history")
                            .getAll(attr('id'), {index: "attribute_id"})
                            .merge(function(best) {
                                return {
                                    measurement: r.db("samplesdb").table("measurements").get(best('measurement_id')).default("")
                                };
                            })
                            .coerceTo("array"),
                        measurements: r.db("samplesdb").table("attribute2measurement")
                            .getAll(attr('id'), {index: "attribute_id"})
                            .eqJoin("measurement_id", r.db("samplesdb").table("measurements"))
                            .zip()
                            .coerceTo("array")
                    };
                })
                .coerceTo("array")
        };
    });

// Get the attributes for a process:
r.db('samplesdb').table("processes").getAll("4239c4f4-0b11-4edf-9a6d-23bff250d62e")
    .eqJoin("id", r.db("samplesdb").table("process2sample"), {index: "process_id"})
    .zip()
    .eqJoin("attribute_set_id", r.db("samplesdb").table("sample2attribute_set"), {index:"attribute_set_id"})
    .zip()
    .merge(function(aset) {
        return {
            attributes: r.db("samplesdb").table("attribute_set2attribute")
                .getAll(aset("attribute_set_id"), {index: "attribute_set_id"})
                .eqJoin("attribute_id", r.db("samplesdb").table("attributes"))
                .zip()
                .merge(function(attr) {
                    return {
                        best_measure: r.db("samplesdb").table("measurements").get(attr("best_measure_id")),
                        history: r.db("samplesdb").table("best_measure_history")
                            .getAll(attr("id"), {index: "attribute_id"})
                            .merge(function(best) {
                                return {
                                    measurement: r.db("samplesdb").table("measurements").get(best("measurement_id")).default("")
                                };
                            })
                            .coerceTo("array"),
                        measurements: r.db("samplesdb").table("attribute2measurement")
                            .getAll(attr("id"), {index: "attribute_id"})
                            .eqJoin("measurement_id", r.db("samplesdb").table("measurements"))
                            .zip()
                            .coerceTo("array")
                    };
                })
                .coerceTo("array")
        };
    });
