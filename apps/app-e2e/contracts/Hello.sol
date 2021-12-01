pragma solidity ^0.4.26;

contract HelloWorld {

    function sayHello() public view returns (string) {
        return ("Hello World");
    }

    string word;

    function saySomething(string _word) public {
        word = _word;
    }

    function listening() public view returns(string){
        return word;
    }

    event Girls(string name, uint age);

    function addGirl(string _name, uint _age) public {
        emit Girls(_name, _age);
    }
}
