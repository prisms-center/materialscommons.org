Application.Services.factory("processTemplates", processTemplates);

function processTemplates() {
    var self = this;
    self.activeTemplate = {};
    self.templates = [
        {
            name: "APT",
            description: "Atom Probe Tomography",
            fn: Apt,
            does_transform: false
        },
        {
            name: "APT Data Analysis",
            description: "Atom Probe Tomography Data Analysis",
            fn: AptDataAnalysis,
            does_transform: false
        },
        {
            name: "APT Data Reconstruction",
            description: "APT Data Reconstruction",
            fn: AptDataReconstruction,
            does_transform: false
        },
        {
            name: "SEM",
            description: "Stem Electron Microscopy",
            fn: Sem ,
            does_transform: false
        },
        {
            name: "As Received",
            description: "As Received process is used to create new samples.",
            fn: AsReceived,
            does_transform: false
        },
        {
            name: "Broad Ion Beam Milling",
            description: "Broad Ion Beam Milling",
            fn: BroadIonBeamMilling,
            does_transform: true
        },
        {
            name: "Cogging",
            description: "Cogging",
            fn: Cogging,
            does_transform: true
        },
        {
            name: "Compression",
            description: "Compression Test",
            fn: Compression,
            does_transform: true
        },
        {
            name: "Computation",
            description: "Computation",
            fn: Computation,
            does_transform: false
        },
        {
            name: "Creep",
            description: "Creep",
            fn: Creep,
            does_transform: true
        },
        {
            name: "DIC Patterning",
            description: "DIC Patterning",
            fn: DicPatterning,
            does_transform: false
        },
        {
            name: "DIC Statistical Modelling",
            description: "DIC Statistical Modelling",
            fn: DicStatisticalModelling,
            does_transform: false
        }
    ];

    return {

        templates: function () {
            return self.templates;
        },

        newInstance: function (template) {
            return new template.fn();
        },

        getActiveTemplate: function () {
            return self.activeTemplate;
        },

        setActiveTemplate: function (template) {
            self.activeTemplate = this.newInstance(template);
        }
    };
}
