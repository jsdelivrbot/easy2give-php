<?php

class Template {

    /**
     * Get template for resource
     * @param $filename
     * @param $paramList
     * @return bool|string
     */
    public function getTemplate($filename, Array $paramList)
    {
        if (is_file($filename)) {
            ob_start();
            extract($paramList);
            include $filename;
            $contents = ob_get_contents();
            ob_end_clean();
            return $contents;
        }
        return false;
    }
}