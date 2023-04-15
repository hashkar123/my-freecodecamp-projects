import os
from pathlib import Path
#!python
'''Builds the README.md file'''
'''The block in README_TEMPLATE.md in which we write the projects starts with {%projects-start%} and ends with {%projects-end%}.

The projects should written in this form: 
## course-name
- ### [first-project](first-project's-url)
- ### [second-project](second-project's-url)
and so on... 
'''


def main():
    README_PATH = Path('./README.md')
    TEMPLATE_PATH = Path('./README_TEMPLATE.md')
    GH_PAGES_URL_START = 'https://hashkar123.github.io/my-freecodecamp-projects/'

    projects_md = get_projects_in_md(GH_PAGES_URL_START)
    write2readme(README_PATH, TEMPLATE_PATH, projects_md)


def get_projects_in_md(url_start: str):
    '''Returns projects in Markdown format'''
    # projects_dict looks like: {
    # '<course1>': [
    # {'pj_name': '<projectName1>', 'pj_url': '<projectURL1>'},
    # {'pj_name': '<projectName2>', 'pj_url': '<projectURL2>'}
    # , ... ],
    # '<course2>': [
    # {'pj_name': '<projectName1>', 'pj_url': '<projectURL1>'},
    # {'pj_name': '<projectName2>', 'pj_url': '<projectURL2>'}
    # , ... ], ...
    # }
    projects_dict: dict[str, list[dict[str, str]]] = {}
    for dirpath, dirnames, filesnames in os.walk(Path('.')):
        if dirpath == '.':
            continue
        # Ignore directories (and their subdirectories) starting with '.' (e.g. './.git')
        dirpath_split = dirpath.split(os.sep)
        # We know dirpath_split has more than one element (including '.') because we dealt with dirpath == '.' (look above)
        # Check all dirs in dirpath (except '.')
        ignore_dir_flag = False
        for dir in dirpath_split[1:]:
            if dir.startswith('.'):
                ignore_dir_flag = True
                break
        if ignore_dir_flag:
            continue
        # Check if current dir has sub-dirs
        if not dirnames:  # if empty
            # Example for dirpath_split: ['.', 'responsive-web-design-new', 'product-landing-page']
            course = dirname2title(dirpath_split[1])
            project_name = dirname2title(dirpath_split[2])
            project_url = url_start + '/'.join(dirpath_split[1:])
            if course not in projects_dict:
                projects_dict[course] = []
            projects_dict[course].append(
                {'pj_name': project_name,
                 'pj_url': project_url})
    # print(projects_dict)
    # return
    # Transform projects_dict into a Markdown-formatted string (in the format specified at the top of this file)
    projects_md = ''
    for course_name, pjs_lst in projects_dict.items():
        projects_md += f'## {course_name}\n'
        for pj_dict in pjs_lst:
            pj_name = pj_dict['pj_name']
            pj_url = pj_dict['pj_url']
            projects_md += f'- ### [{pj_name}]({pj_url})\n'
        projects_md += '\n'
    # print(projects_md)
    return (projects_md)


def dirname2title(name: str):
    # For example:
    # responsive-web-design-new => Responsive Web Design New
    return ' '.join(name.split('-')).title()


def write2readme(readme_path: str, template_path, projects_md: str = 'No projects found'):
    '''Uses the template to write projects to README.md'''

    with open(template_path, 'r', encoding='UTF-8') as f:
        template = f.read()
    block_start = '{%projects-start%}'
    block_end = '{%projects-end%}'
    block_start_idx = template.find(block_start)  # index
    block_end_idx = template.find(block_end)  # index
    if block_start_idx == -1 or block_end_idx == -1:
        print('ERROR! block_start or block_end NOT FOUND!')
        print('Quitting...')
        quit()
    if block_start_idx > block_end_idx:
        print('ERROR! block_start is found AFTER block_end!')
        print('Quitting...')
        quit()
    # print(template[block_start_idx:block_end_idx+len(block_end)+1]) # This is the slice of the block

    readme_md = ''.join([template[:block_start_idx], projects_md, template[block_end_idx+len(block_end)+1:]])
    with open(readme_path, 'w', encoding='UTF-8') as f:
        f.write(readme_md)


if __name__ == "__main__":
    main()
