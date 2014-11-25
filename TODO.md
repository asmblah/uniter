TODO
====

- Fix push indexing when string keys exist

$ php -r '$a = array(); $a["first"] = 21; $a[] = 7; var_dump($a);'
array(2) {
  'first' =>
  int(21)
  [0] =>
  int(7)
}

$ uniter -r '$a = array(); $a["first"] = 21; $a[] = 7; var_dump($a);'
array(2) {
  ["first"]=>
  int(21)
  [1]=>
  int(7)
}
