class Coords {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class StoneType {
  /**
   * @param {string} color
   * @param {HTMLImageElement} element
   */
  constructor(color, element) {
    this.color = color;
    this.element = element;
  }
}

class StoneTypeSet {
  constructor() {
    this.items = [];
  }

  /**
   * @param {StoneType} stoneType
   * @returns {StoneTypeSet}
   */
  add(stoneType) {
    this.items.push(stoneType);
    return this;
  }

  /**
   * @param {string} color
   * @returns {StoneType}
   */
  get(color) {
    let pickedStoneType = false;
    this.items.some(
      /** @param {StoneType} stoneType */
      function(stoneType) {
        if (stoneType.color === color) {
          pickedStoneType = stoneType;
        }
      }
    );
    return pickedStoneType;
  }
}

class Stone {
  /**
   * @param {number} pos
   * @param {StoneType} stoneType
   */
  constructor(pos, stoneType) {
    this.pos = pos;
    this.stoneType = stoneType;
  }

  /**
   * @param {Player} player
   * @param {SpotSet} spots
   * @returns {Spot|boolean}
   */
  getNextPosition(player, spots) {
    let currSpot = spots.get(this.pos);
    if (currSpot instanceof HouseSpot) {
      if (player.dice.value === 6) {
        return spots.get(currSpot.next);
      }
    } else {
      for (let i = 0; i < player.dice.value; i++) {
        let nextSpot = spots.get(currSpot.next);
        if (currSpot instanceof HomeSpot && currSpot.owner === player && !(nextSpot instanceof HomeSpot)) {
          return false;
        }
        while (nextSpot instanceof PrivateSpot && nextSpot.owner !== player && (nextSpot instanceof HouseSpot || nextSpot instanceof HomeSpot)) {
          currSpot = spots.get(currSpot.next);
          nextSpot = spots.get(currSpot.next);
        }
        currSpot = spots.get(currSpot.next);
      }
      return currSpot;
    }
  }

  /**
   * @param {Spot} nextPos
   * @param {SpotSet} spots
   * @param {PlayerSet} players
   */
  move(nextPos, spots, players) {
    players.items.some(
      /** @param {Player} player */
      player => {
        player.stones.items.some(
          /** @param {Stone} stone */
          stone => {
            if (stone.pos === nextPos.pos) {
              stone.pos = spots.getFreeHouse(player).pos;
            }
          }
        )
      }
    );
    this.pos = nextPos.pos;
  }
}

class StoneSet {
  constructor() {
    this.items = [];
  }

  /**
   * @param {Stone} stone
   * @returns {StoneSet}
   */
  add(stone) {
    this.items.push(stone);
    return this;
  }

  /**
   * @param {SpotSet} spots
   * @returns {boolean}
   */
  allHome(spots) {
    let allHome = true;
    this.items.some(
      /** @param {Stone} stone */
      function(stone) {
        if (!(spots.items[stone.pos] instanceof HomeSpot)) {
          allHome = false;
        }
      }
    );
    return allHome;
  }

  /**
   * @param {SpotSet} spots
   * @returns {boolean}
   */
  allHouseHome(spots) {
    let allHouseHome = true;
    this.items.some(
      /**
       * @param {Stone} stone
       */
      function(stone) {
        if (!(spots.items[stone.pos] instanceof HomeSpot) && !(spots.items[stone.pos] instanceof HouseSpot)) {
          allHouseHome = false;
        }
      }
    );
    return allHouseHome;
  }

  /**
   * @param {Player} player
   * @param {SpotSet} spots
   * @returns {boolean}
   */
  movePossible(player, spots) {
    let movePossible = false;
    this.items.some(
      /** @param {Stone} stone */
      stone => {
        if (stone.getNextPosition(player, spots)) {
          movePossible = true;
        }
      }
    );
    return movePossible;
  }
}

class Dice {
  /**
   * @param {Coords} coords
   */
  constructor(coords) {
    this.coords = coords;
    this.element = document.getElementById('dice-image');
    this.throw();
  }

  /**
   * @returns {number}
   */
  throw(){
    this.value = Math.floor(Math.random() * (Math.floor(7 ) - Math.ceil(1)) + Math.ceil(1));
    return this.value;
  }
}

class PlayerSet {
  constructor() {
    this.items = [];
  }

  /**
   * @param {Player} player
   * @returns {PlayerSet}
   */
  add(player) {
    this.items.push(player);
    return this;
  }

  /**
   * @param {string} color
   * @returns {Player}
   */
  get(color) {
    let pickedPlayer = false;
    this.items.some(
      /** @param {Player} player */
      function(player) {
        if (player.color === color) {
          pickedPlayer = player;
        }
      }
    );
    return pickedPlayer;
  }

  /**
   * @returns {Player}
   */
  getRandom() {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }

  /**
   * @param {Player} player
   * @returns {Player}
   */
  getNext(player) {
    let nextPlayer = false;
    this.items.some(
      /**
       * @param {Player} currPlayer
       * @param {number} index
       * @param {Array} items
       */
      function(currPlayer, index, items) {
        if (currPlayer.color === player.color) {
          nextPlayer = items[(index + 1) % items.length];
        }
      }
    );
    return nextPlayer;
  }
}

class Player {
  /**
   * @param {string} color
   * @param {Dice} dice
   * @param {StoneSet} stones
   */
  constructor(color, dice, stones) {
    this.color = color;
    this.dice = dice;
    this.stones = stones;
  }
}

class SpotSet {
  constructor() {
    this.items = [];
  }

  /**
   * @param {Spot} spot
   * @returns {SpotSet}
   */
  add(spot) {
    this.items.push(spot);
    return this;
  }

  /**
   * @param index
   * @returns {Spot}
   */
  get(index) {
    return this.items[index];
  }

  /**
   * @param {Player} player
   * @return {boolean|Spot}
   */
  getFreeHouse(player) {
    let freeHouse = false;
    this.items.some(
      /** @param {Spot} spot */
      spot => {
        if (spot instanceof HouseSpot && spot.owner === player) {
          let vacant = true;
          player.stones.items.forEach(
            /** @param {Stone} stone */
            stone => {
              if (stone.pos === spot.pos) {
                vacant = false;
              }
            }
          );
          if (vacant) {
            freeHouse = spot;
          }
        }
      }
    );
    return freeHouse;
  }
}

class Spot {
  /**
   * @param {Coords} coords
   * @param {number} pos
   * @param {number} next
   */
  constructor(coords, pos, next) {
    this.coords = coords;
    this.pos = pos;
    this.next = next;
  }
}

/**
 * @extends Spot
 */
class PrivateSpot extends Spot {
  /**
   * @param {Coords} coords
   * @param {number} pos
   * @param {number} next
   * @param {Player} owner
   */
  constructor(coords, pos, next, owner) {
    super(coords, pos, next);
    this.owner = owner;
  }
}

/**
 * @extends PrivateSpot
 */
class HouseSpot extends PrivateSpot {
  /**
   * @param {Coords} coords
   * @param {number} pos
   * @param {number} next
   * @param {Player} owner
   */
  constructor(coords, pos, next, owner) {
    super(coords, pos, next, owner);
  }
}

/**
 * @extends PrivateSpot
 */
class StartSpot extends PrivateSpot {
  /**
   * @param {Coords} coords
   * @param {number} pos
   * @param {number} next
   * @param {Player} owner
   */
  constructor(coords, pos, next, owner) {
    super(coords, pos, next, owner);
  }
}

/**
 * @extends PrivateSpot
 */
class HomeSpot extends PrivateSpot {
  /**
   * @param {Coords} coords
   * @param {number} pos
   * @param {number} next
   * @param {Player} owner
   */
  constructor(coords, pos, next, owner) {
    super(coords, pos, next, owner);
  }
}

class DiceNumber {
  /**
   * @param {Coords} coords
   */
  constructor(coords) {
    this.coords = coords;
  }
}

class DiceNumberSet {
  constructor() {
    this.items = [];
  }

  /**
   * @param {DiceNumber} diceNumber
   * @param {number} position
   * @returns {DiceNumberSet}
   */
  add(diceNumber, position) {
    this.items[position] = diceNumber;
    return this;
  }

  /**
   * @param {number} diceNumber
   * @returns {DiceNumber}
   */
  get(diceNumber) {
    return this.items[diceNumber];
  }
}

class StateSet {
  constructor() {
    this.items = [];
  }

  /**
   * @param {State} state
   * @return {StateSet}
   */
  set(state) {
    this.items.push(state);
    return this;
  }

  /**
   * @returns {State}
   */
  get() {
    return this.items[this.items.length-1];
  }
}

/**
 * @abstract
 */
class State {
  /**
   * @param {Player} player
   */
  constructor(player) {
    this.player = player;
  }

  /**
   * @param {Cursor} cursor
   * @param {SpotSet} spots
   */
  interact(cursor, spots) {}

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {SpotSet} spots
   * @return {State}
   */
  change(context, spots) {
    return this;
  }
}

/**
 * @extends State
 */
class MoveState extends State {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {SpotSet} spots
   * @returns {Dice1State}
   */
  change(context, spots) {
    this.drawHint(context, spots);
    return this;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {SpotSet} spots
   */
  drawHint(context, spots) {
    this.player.stones.items.forEach(
      /** @param {Stone} stone */
      stone => {
        let nextPos = stone.getNextPosition(this.player, spots);
        if (nextPos) {
          new Hint(nextPos.coords).render(context, 20, 63);
        }
      }
    );
  }

  /**
   * @param {Cursor} cursor
   * @param {SpotSet} spots
   * @returns {Dice3State|EndState|MoveState}
   */
  interact(cursor, spots) {
    for (let i = 0; i<this.player.stones.items.length; i++) {
      let stone = this.player.stones.items[i];
      let nextPos = stone.getNextPosition(this.player, spots);
      if (nextPos) {
        if (cursor.matchCoords(nextPos.coords)) {
          return this.clicked(stone, nextPos, spots, players);
        }
      }
    }
  }

  /**
   * @param {Stone} stone
   * @param {number} nextPos
   * @param {SpotSet} spots
   * @param {PlayerSet} players
   * @returns {State}
   */
  clicked(stone, nextPos, spots, players) {
    stone.move(nextPos, spots, players);
    if (this.player.dice.value === 6 && !this.player.stones.allHouseHome(spots)) {
      return new DiceState(this.player);
    }
    return new EndState(this.player);
  }
}

/**
 * @extends State
 */
class EndState extends State {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {SpotSet} spots
   * @returns {StartState}
   */
  change(context, spots) {
    return new StartState(players.getNext(this.player));
  }
}

/**
 * @extends State
 */
class DiceState extends State {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {SpotSet} spots
   * @returns {Dice1State}
   */
  change(context, spots) {
    this.drawHint(context);
    return this;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  drawHint(context) {
    new Hint(this.player.dice.coords).render(context, 36, 36);
  }

  /**
   * @param {Cursor} cursor
   * @param {SpotSet} spots
   * @returns {Dice1State|EndState|Dice2State|MoveState}
   */
  interact(cursor, spots) {
    if (cursor.matchCoords(this.player.dice.coords)) {
      return this.clicked(spots);
    }
    return this;
  }

  /**
   * @param {SpotSet} spots
   * @returns {EndState|MoveState}
   */
  clicked(spots) {
    this.player.dice.throw();
    if (this.player.stones.movePossible(this.player, spots)) {
      return new MoveState(this.player);
    }
    return new EndState(this.player);
  }
}

/**
 * @extends DiceState
 */
class Dice3State extends DiceState {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {SpotSet} spots
   * @returns {EndState|MoveState}
   */
  clicked(spots) {
    this.player.dice.throw();
    if (this.player.dice.value === 6 && this.player.stones.movePossible(this.player, spots)) {
      return new MoveState(this.player);
    }
    return new EndState(this.player);
  }
}

/**
 * @extends DiceState
 */
class Dice2State extends DiceState {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {SpotSet} spots
   * @returns {EndState|Dice3State|MoveState}
   */
  clicked(spots) {
    this.player.dice.throw();
    if (this.player.dice.value !== 6) {
      return new Dice3State(this.player);
    }
    if (this.player.stones.movePossible(this.player, spots)) {
      return new MoveState(this.player);
    }
    return new EndState(this.player);
  }
}

/**
 * @extends DiceState
 */
class Dice1State extends DiceState {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {SpotSet} spots
   * @returns {EndState|Dice2State|MoveState}
   */
  clicked(spots) {
    this.player.dice.throw();
    if (this.player.stones.allHouseHome(spots)) {
      if (this.player.dice.value !== 6) {
        return new Dice2State(this.player);
      }
    }
    if (this.player.stones.movePossible(this.player, spots)) {
      return new MoveState(this.player);
    }
    return new EndState(this.player);
  }
}

/**
 * @extends State
 */
class StartState extends State {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(player);
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {SpotSet} spots
   * @returns {State}
   */
  change(context, spots) {
    if (this.player.stones.allHome(spots)) {
      return new EndState(this.player);
    }
    return new Dice1State(this.player);
  }
}

class Hint {
  /**
   * @param {Coords} coords
   */
  constructor(coords) {
    this.coords = coords;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  render(context, offsetX, offsetY) {
    context.beginPath();
    context.lineWidth = 10;
    context.strokeStyle = "#7F00FF";
    context.arc(this.coords.x +offsetX, this.coords.y +offsetY, 46, 0, 2 * Math.PI);
    context.stroke();
  }
}

class Board {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} width
   * @param {number} height
   * @param {HTMLImageElement} boardImageElement
   * @param {PlayerSet} players
   * @param {SpotSet} spots
   */
  constructor(canvas, width, height, boardImageElement, players, spots) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.boardImageElement = boardImageElement;
    this.players = players;
    this.spots = spots;
    this.context = this.canvas.getContext('2d');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.state = new StateSet().set(new StartState(this.players.getRandom()));
  }

  renderStones() {
    this.players.items.forEach(player => {
      player.stones.items.forEach(
        /**
         * @param {Stone} stone
         */
        stone => {
          let stoneSpot = this.spots.get(stone.pos);
          this.context.drawImage(stone.stoneType.element, stoneSpot.coords.x, stoneSpot.coords.y, 40, 80);
        }
      )
    });
  }

  renderDice() {
    this.players.items.forEach(player => {
      let diceNumber = diceNumbers.get(player.dice.value);
      this.context.drawImage(player.dice.element, diceNumber.coords.x, diceNumber.coords.y, 220, 220, player.dice.coords.x, player.dice.coords.y, 70, 70);
    });
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.boardImageElement, 0, 0, this.width, this.height);
    this.renderStones();
    this.renderDice();
    this.state.set(this.state.get().change(this.context, this.spots));
  }
}

class Cursor {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {event} event
   */
  constructor(canvas, event) {
    let rect = canvas.getBoundingClientRect()
    this.coords = new Coords(event.clientX - rect.left, event.clientY - rect.top);
  }

  /**
   * @param {Coords} coords
   * @returns {boolean}
   */
  matchCoords(coords) {
    let diffX = this.coords.x-coords.x;
    let diffY = this.coords.y-coords.y;
    return diffX > -10 && diffX < 80 && diffY > -10 && diffY < 80;
  }
}

let stoneTypes = new StoneTypeSet()
  .add(new StoneType('red', document.getElementById('stone-red')))
  .add(new StoneType('blue', document.getElementById('stone-blue')))
  .add(new StoneType('yellow', document.getElementById('stone-yellow')))
  .add(new StoneType('green', document.getElementById('stone-green')));

let players = new PlayerSet()
  .add(new Player('red', new Dice(new Coords(200, 190)), new StoneSet().add(new Stone(0, stoneTypes.get('red'))).add(new Stone(1, stoneTypes.get('red'))).add(new Stone(2, stoneTypes.get('red'))).add(new Stone(3, stoneTypes.get('red')))))
  .add(new Player('blue', new Dice(new Coords(530, 190)), new StoneSet().add(new Stone(19, stoneTypes.get('blue'))).add(new Stone(20, stoneTypes.get('blue'))).add(new Stone(21, stoneTypes.get('blue'))).add(new Stone(22, stoneTypes.get('blue')))))
  .add(new Player('yellow', new Dice(new Coords(530, 530)), new StoneSet().add(new Stone(37, stoneTypes.get('yellow'))).add(new Stone(38, stoneTypes.get('yellow'))).add(new Stone(40, stoneTypes.get('yellow'))).add(new Stone(39, stoneTypes.get('yellow')))))
  .add(new Player('green', new Dice(new Coords(200, 530)), new StoneSet().add(new Stone(58, stoneTypes.get('green'))).add(new Stone(57, stoneTypes.get('green'))).add(new Stone(56, stoneTypes.get('green'))).add(new Stone(55, stoneTypes.get('green')))))

let spots = new SpotSet()
  .add(new HouseSpot(new Coords(65, 15), 0, 4, players.get('red')))
  .add(new HouseSpot(new Coords(114, 16), 1, 4, players.get('red')))
  .add(new HouseSpot(new Coords(65, 65), 2, 4, players.get('red')))
  .add(new HouseSpot(new Coords(114, 65), 3, 4, players.get('red')))
  .add(new StartSpot(new Coords(62, 270), 4, 5, players.get('red')))
  .add(new Spot(new Coords(125, 270), 5, 6))
  .add(new Spot(new Coords(189, 271), 6, 7))
  .add(new Spot(new Coords(253, 272), 7, 8))
  .add(new Spot(new Coords(318, 273), 8, 9))
  .add(new Spot(new Coords(319, 208), 9, 10))
  .add(new Spot(new Coords(319, 141), 10, 11))
  .add(new Spot(new Coords(319, 77), 11, 12))
  .add(new Spot(new Coords(319, 11), 12, 13))
  .add(new Spot(new Coords(382, 11), 13, 14))
  .add(new HomeSpot(new Coords(381, 78), 14, 15, players.get('blue')))
  .add(new HomeSpot(new Coords(381, 143), 15, 16, players.get('blue')))
  .add(new HomeSpot(new Coords(381, 208), 16, 17, players.get('blue')))
  .add(new HomeSpot(new Coords(380, 273), 17, 18, players.get('blue')))
  .add(new StartSpot(new Coords(443, 13), 18, 23, players.get('blue')))
  .add(new HouseSpot(new Coords(648, 22), 19, 18, players.get('blue')))
  .add(new HouseSpot(new Coords(697, 22), 20, 18, players.get('blue')))
  .add(new HouseSpot(new Coords(647, 71), 21, 18, players.get('blue')))
  .add(new HouseSpot(new Coords(697, 71), 22, 18, players.get('blue')))
  .add(new Spot(new Coords(445, 77), 23, 24))
  .add(new Spot(new Coords(445, 141), 24, 25))
  .add(new Spot(new Coords(444, 208), 25, 26))
  .add(new Spot(new Coords(443, 272), 26, 27))
  .add(new Spot(new Coords(507, 272), 27, 28))
  .add(new Spot(new Coords(571, 272), 28, 29))
  .add(new Spot(new Coords(635, 272), 29, 30))
  .add(new Spot(new Coords(699, 272), 30, 31))
  .add(new Spot(new Coords(699, 338), 31, 32))
  .add(new HomeSpot(new Coords(634, 338), 32, 33, players.get('yellow')))
  .add(new HomeSpot(new Coords(570, 338), 33, 34, players.get('yellow')))
  .add(new HomeSpot(new Coords(506, 338), 34, 35, players.get('yellow')))
  .add(new HomeSpot(new Coords(442, 338), 35, 36, players.get('yellow')))
  .add(new StartSpot(new Coords(696, 400), 36, 41, players.get('yellow')))
  .add(new HouseSpot(new Coords(693, 608), 37, 36, players.get('yellow')))
  .add(new HouseSpot(new Coords(693, 657), 38, 36, players.get('yellow')))
  .add(new HouseSpot(new Coords(644, 657), 39, 36, players.get('yellow')))
  .add(new HouseSpot(new Coords(644, 608), 40, 36, players.get('yellow')))
  .add(new Spot(new Coords(634, 400), 41, 42))
  .add(new Spot(new Coords(570, 400), 42, 43))
  .add(new Spot(new Coords(506, 400), 43, 44))
  .add(new Spot(new Coords(443, 400), 44, 45))
  .add(new Spot(new Coords(442, 465), 45, 46))
  .add(new Spot(new Coords(442, 530), 46, 47))
  .add(new Spot(new Coords(441, 595), 47, 48))
  .add(new Spot(new Coords(441, 660), 48, 49))
  .add(new Spot(new Coords(378, 660), 49, 50))
  .add(new HomeSpot(new Coords(378, 597), 50, 51, players.get('green')))
  .add(new HomeSpot(new Coords(378, 531), 51, 52, players.get('green')))
  .add(new HomeSpot(new Coords(379, 467), 52, 53, players.get('green')))
  .add(new HomeSpot(new Coords(379, 400), 53, 54, players.get('green')))
  .add(new StartSpot(new Coords(316, 659), 54, 59, players.get('green')))
  .add(new HouseSpot(new Coords(110, 655), 55, 54, players.get('green')))
  .add(new HouseSpot(new Coords(61, 655), 56, 54, players.get('green')))
  .add(new HouseSpot(new Coords(61, 605), 57, 54, players.get('green')))
  .add(new HouseSpot(new Coords(111, 605), 58, 54, players.get('green')))
  .add(new Spot(new Coords(316, 595), 59, 60))
  .add(new Spot(new Coords(316, 530), 60, 61))
  .add(new Spot(new Coords(317, 466), 61, 62))
  .add(new Spot(new Coords(317, 400), 62, 63))
  .add(new Spot(new Coords(252, 400), 63, 64))
  .add(new Spot(new Coords(188, 400), 64, 65))
  .add(new Spot(new Coords(124, 400), 65, 66))
  .add(new Spot(new Coords(60, 400), 66, 67))
  .add(new Spot(new Coords(60, 334), 67, 68))
  .add(new HomeSpot(new Coords(124, 334), 68, 69, players.get('red')))
  .add(new HomeSpot(new Coords(188, 334), 69, 70, players.get('red')))
  .add(new HomeSpot(new Coords(250, 334), 70, 71, players.get('red')))
  .add(new HomeSpot(new Coords(317, 334), 71, 4, players.get('red')));

let diceNumbers = new DiceNumberSet()
  .add(new DiceNumber(new Coords(-10, 210)), 1)
  .add(new DiceNumber(new Coords(210, 210)), 2)
  .add(new DiceNumber(new Coords(423, 210)), 3)
  .add(new DiceNumber(new Coords(638, 210)), 4)
  .add(new DiceNumber(new Coords(850, 210)), 5)
  .add(new DiceNumber(new Coords(1065, 210)), 6);

function startGame() {
  let board = new Board(
    document.getElementById("board"),
    800,
    800,
    document.getElementById("board-image"),
    players,
    spots
  );
  setInterval(function() {
    board.render();
  }, 100);
  board.canvas.addEventListener('mousedown', function(e) {
    board.state.set(board.state.get().interact(new Cursor(board.canvas, e), board.spots)) ;
  });
}
