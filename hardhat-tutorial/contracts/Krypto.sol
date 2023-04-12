// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract Krypto is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    uint public tokenIds;
    uint public maxTokenIds = 20;
    uint public _price = 0.01 ether;
    bool public paused;
    bool public preSaleStarted;
    uint public preSaleEnded;
    IWhitelist whitelist;

    modifier whenNotPaused{
        require(!paused,"Contract currently running");
        _;
    }

    constructor (string memory baseURI, address whitelistContract) ERC721("Krypto","KK") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner{
        preSaleStarted = true;
        preSaleEnded = block.timestamp + 5 minutes;
    }

    function preSaleMint() public payable whenNotPaused{
        require(preSaleStarted && block.timestamp < preSaleEnded,"Presale not running");
        require(whitelist.whitelistedAddress(msg.sender),"Not in whitelist");
        require(tokenIds < maxTokenIds,"All tokens minted");
        require(msg.value >= _price,"Ether sent not sufficient");
        tokenIds +=1;
        _safeMint(msg.sender,tokenIds);
    }

    function mint() public payable whenNotPaused{
        require(preSaleStarted && block.timestamp >= preSaleEnded,"Presale not ended yet");
        require(tokenIds < maxTokenIds,"All tokens minted");
        require(msg.value >= _price,"Ether sent not sufficient");
        tokenIds +=1;
        _safeMint(msg.sender,tokenIds);
    }

    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI;
    }

    function setPaused(bool val) public {
        paused = val;
    }

    function withdraw()  public payable onlyOwner{
        address _owner = owner();
        uint amount = address(this).balance;
        (bool sent,) = _owner.call{value:amount}("");
        require(sent,"Ether transaction failed");
    }

    receive() external payable{}

    fallback() external payable{}

}

