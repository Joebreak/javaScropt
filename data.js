const players = [{
        name: "你",
        isSelf: true,
        hand: [{
                color: "RED",
                number: 3,
                knownColor: false,
                knownNumber: true
            }, {
                color: "BLUE",
                number: 1,
                knownColor: false,
                knownNumber: false
            }, {
                color: "YELLOW",
                number: 2,
                knownColor: true,
                knownNumber: false
            },
        ]
    }, {
        name: "A1",
        hand: [{
                color: "RED",
                number: 1,
                knownColor: true,
                knownNumber: true
            }, {
                color: "GREEN",
                number: 3,
                knownColor: true,
                knownNumber: false
            }, {
                color: "BLUE",
                number: 2,
                knownColor: false,
                knownNumber: true
            },
        ]
    },{
        name: "A2",
        hand: [{
                color: "RED",
                number: 1,
                knownColor: true,
                knownNumber: true
            }, {
                color: "GREEN",
                number: 3,
                knownColor: true,
                knownNumber: false
            }, {
                color: "YELLOW",
                number: 5,
                knownColor: false,
                knownNumber: true
            }, {
                color: "GREEN",
                number: 1,
                knownColor: false,
                knownNumber: true
            }
        ]
    }
];

const discardPile = [{
        color: "RED",
        number: 1
    }, {
        color: "BLUE",
        number: 4
    }, {
        color: "GREEN",
        number: 2
    }, {
        color: "GREEN",
        number: 2
    },
];

const fireworks = [{
        color: "RED",
        number: 2
    }, {
        color: "BLUE",
        number: 1
    }, {
        color: "GREEN",
        number: 3
    },
];
