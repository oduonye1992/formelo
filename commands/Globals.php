<?php


namespace commands;


class Globals
{
    public static function isFolderExist($folderName)
    {
        // Create or return the folder
    }
    public function createIfNotExist($filename){
        if (!file_exists($filename)){
            fopen($filename, "w");
            fclose($filename);
        }
    }
    public static function getJSON(){
        $filename = "app/pages/pages.json";
        // CHeck if file exist
        $handle = fopen($filename, "r");
        $contents = fread($handle, filesize($filename));
        fclose($handle);
        return json_decode($contents);
    }
    public static function saveJSON($json){
        $filename = "app/pages/pages.json";
        $handle = fopen($filename, "w");
        fwrite($handle, json_encode($json));
        fclose($handle);
    }
    public static function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
    public static function getFileContents($filename){
        $handle = fopen($filename, "r") or die('Error opening '.$filename);
        $contents = fread($handle, filesize($filename)+1);
        fclose($handle);
        return $contents;
    }
}