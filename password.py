#!/usr/bin/python3
# -*- coding: utf-8 -*-

import web
import web.utils
import re
import math
import secrets
import json

# **********************************************************************

class fourwords:
    def do_the_things( self ):
        web.header('Content-Type', 'application/json')
        data = json.loads( web.data().decode(encoding="utf-8") )
        minletters = int( data["minletters"] )
        maxletters = int( data["maxletters"] )
        startcaps = data["startcaps"]

        if startcaps:
            lettermatch = re.compile("^[A-Za-z]+$")
        else:
            lettermatch = re.compile("^[a-z]+$")

        words = []
        wordfile = open("/usr/share/dict/words", encoding="utf-8")
        for word in wordfile:
            word = word.strip()
            if len(word) < minletters or len(word) > maxletters:
                continue
            if (not startcaps) and word[0].isupper(): continue
            if lettermatch.match(word) is None: continue
            words.append(word)
                
                
        wordfile.close()
        wordlistsize = len(words)
        entropybits = int( math.floor( 4 * math.log(wordlistsize) / math.log(2) ) )
            
        password = ""
        for nword in range(4):
            if nword > 0:
                password += " ";
            password += words[ secrets.randbelow( wordlistsize ) ]
                
        return json.dumps( { "bits": entropybits, "password": password } )
    
    def GET(self):
        return self.do_the_things()

    def POST(self):
        return self.do_the_things()

    
# **********************************************************************

class barf:
    def do_the_things( self ):
        web.header('Content-Type', 'application/json')
        data = json.loads( web.data().decode(encoding="utf-8") )
        numofcharacters = int( data["numchars"] )
        caps = data["caps"]
        numbers = data["numbers"]
        symbols = data["symbols"]

        base = "abcdefghijklmnopqrstuvwxyz"
        if caps:
            base += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        if numbers:
            base += "0123456789"
        if symbols:
            base += "!@#$%^&*()_-+=:;,.<>/?~{}[]|"

        basesize = len(base)
        entropybits = int( math.floor( numofcharacters * math.log( basesize ) / math.log( 2 ) ) )

        password = ""
        for nchar in range( numofcharacters ):
            password += base[ secrets.randbelow( basesize ) ]

        return json.dumps( { "bits": entropybits, "password": password } )
        
    def GET(self):
        return self.do_the_things()

    def POST(self):
        return self.do_the_things()

# **********************************************************************

urls = ( "/fourwords", "fourwords",
         "/barf", "barf" )
app = web.application(urls, locals())
application = app.wsgifunc()
