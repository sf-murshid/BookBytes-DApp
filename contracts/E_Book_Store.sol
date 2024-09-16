
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract E_Book_Store {
    string public name;
    address public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => mapping(uint256 => Order)) public orders;
    mapping(address => uint256) public orderCount;

    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    constructor() {
        name = "E_Book_Store";
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    //List of Products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        //Create Item Struct
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        //Save Item struct to blockchain
        items[_id] = item;

        //Emit an event
        emit List(_name, _cost, _stock);
    }

    //Buying Product
    function buy(uint256 _id) public payable {
        // Fetch item
        Item memory item = items[_id];

        // Require enough ether to buy item
        require(msg.value >= item.cost);

        // Require item is in stock
        require(item.stock > 0);

        // Create order
        Order memory order = Order(block.timestamp, item);

        // Add order for user
        uint256 orderId = orderCount[msg.sender] + 1;
        orderCount[msg.sender] = orderId;
        orders[msg.sender][orderId] = order;

        // Subtract stock
        items[_id].stock = items[_id].stock - 1;

        // Emit event
        emit Buy(msg.sender, orderId, item.id);
    }

    //withdraw
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
