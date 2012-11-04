/*
BSD Licence

Copyright (c) 2011, Emidio STANI
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of the creator nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

//-----------------
History:

1.0:
	-Initial release
*/

this.options = {
	opentype: "[shape=Mrecord]",
	verifytype: "[shape=record, color=green]",
	asserttype: "[shape=record, color=green]",
	typetype: "[shape=record, color=red]",
	clicktype: "[shape=record, color=blue]",
	defaulttype: "[shape=record]",
	footer: "overlap=false fontsize=\"15\"",
	arrowstyle: "[color=black]",
	arrownumber: "true"
};

this.configForm =
	'<description>Open node style</description>' +
	'<textbox id="options_opentype" flex="1"/>' +
	'<description>Verify node style</description>' +
	'<textbox id="options_verifytype" flex="1"/>' +
	'<description>Assert node style</description>' +
	'<textbox id="options_asserttype" flex="1"/>' +
	'<description>Type node style</description>' +
	'<textbox id="options_typetype" flex="1"/>' +
	'<description>Click node style</description>' +
	'<textbox id="options_clicktype" flex="1"/>' +
	'<description>Default node style</description>' +
	'<textbox id="options_defaulttype" flex="1"/>' +
	'<description>Footer</description>' +
	'<textbox id="options_footer" flex="1"/>' +
	'<description>Arrow style</description>' +
	'<textbox id="options_arrowstyle" flex="1"/>' +
	'<separator class="groove"/>' +
	'<checkbox id="options_arrownumber" label="Arrow number"/>';

var dot = {
	start_table: "digraph seleniumgraph { \n",
	end_table: "}",
	start_node: "node",
	end_row: "\n",
	separator: "|",
	start_label: "[label=\"",
	end_label: "\"];",
	arrow: '->',
	title: ""
};

function formatCommands(commands) {
	var result = '',
		start_table =  dot.start_table,
		end_table =  dot.end_table,
		start_node = dot.start_node,
		end_row = dot.end_row,
		sep = dot.separator,
		start_label = dot.start_label,
		end_label = dot.end_label,
		node_type = "",
		open_type = this.options.opentype,
		verify_type = this.options.verifytype,
		assert_type = this.options.asserttype,
		type_type = this.options.typetype,
		click_type = this.options.clicktype,
		default_type = this.options.defaulttype,
		footer = this.options.footer + " label=\"" + dot.title + "\"",
		arrow = dot.arrow,
		arrow_style = this.options.arrowstyle,
		arrow_number = this.options.arrownumber,
		i = 0,
		j = 0,
		comlen = commands.length,
		node_list = '',
		temp = comlen - 1,
		label_arrow = "",
		command,
		target = "",
		value = "";

	for (i = 0; i < comlen; i += 1) {
		command = commands[i];
		if (command.type == 'command') {
			if (command.command.substring(4, 0) == "open") {
				node_type = open_type;
			} else if (command.command.substring(6, 0) == "verify") {
				node_type = verify_type;
			} else if (command.command.substring(6, 0) == "assert") {
				node_type = assert_type;
			} else if (command.command.substring(4, 0) == "type") {
				node_type = type_type;
			} else if (command.command.substring(5, 0) == "click") {
				node_type = click_type;
			} else {
				node_type = default_type;
			}

			target = command.target.replace(/\{/gi, "\\{").replace(/\}/gi, "\\}");
			value = command.value.replace(/\{/gi, "\\{").replace(/\}/gi, "\\}");
			result += start_node + i + node_type + start_label + command.command + sep + target + sep + value + end_label + end_row;
		}
	}

	for (i = 0; i < temp; i += 1) {
		if (arrow_number == 'true') {
			label_arrow = "[label=\" " + (i + 1) + "\"]";
		}
		node_list += start_node + i + arrow + start_node + (i + 1) + arrow_style + label_arrow + ";\n";
	}

	label_arrow = "";
	for (i = 0; i < comlen; i += 1) {
		if (commands[i].command == "gotoIf") {
			value = commands[i].value;
			for (j = 0; j < comlen; j += 1) {
				if (commands[j].command == "label" && commands[j].target == value) {
					temp = temp + 1;
					if (arrow_number == 'true') {
						label_arrow = "[label=\" " + temp + "\"]";
					}
					node_list += start_node + i + arrow + start_node + j + arrow_style + label_arrow + ";\n";
				}
			}
		}
	}

	result = start_table + result + "\n" + node_list + "\n" + footer + "\n" + end_table;
	return result;
}

function parse(testCase, source) {
	var doc = source,
		commands = [],
		sep = dot.separator,
		start_label = dot.start_label,
		end_label = dot.end_label,
		line,
		array = [],
		array2 = [],
		command;
	while (doc.length > 0) {
		line = /(.*)(\r\n|[\r\n])?/.exec(doc);
		array = line[1].split(start_label);
		if (array.length == 2) {
			array2 = array[1].substring(0, array[1].length - end_label.length).split(sep);
			if (array2.length == 3) {
				command = new Command();
				command.command = array2[0];
				command.target = array2[1];
				command.value = array2[2];
				commands.push(command);
			}
		}
		doc = doc.substr(line[0].length);
	}
	testCase.setCommands(commands);
}

function format(testCase, name) {
	dot.title = testCase.title;
	return formatCommands(testCase.commands);
}

