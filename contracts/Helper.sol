pragma solidity ^0.6.0;

contract Helper {
	function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }


    function bytes2ToString(bytes2 _bytes2) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 2 && _bytes2[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 2 && _bytes2[i] != 0; i++) {
            bytesArray[i] = _bytes2[i];
        }
        return string(bytesArray);
    }
}